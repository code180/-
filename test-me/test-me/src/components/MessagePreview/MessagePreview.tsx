import React, {useState} from "react";
import VariableInput from "../VariableInput/VariableInput";
import {deserializeTemplate, findVariablesInTemplate, generateMessage, serializeTemplate} from "../../utils";
import {BlockType, IfThenElse, Template} from "../../types";
import {defaultTemplate} from "../../constants";
import styles from "./MessagePreview.module.css";

interface MessagePreviewProps {
    arrVarNames: string[];
    template: Template | null;
    onClose: () => void;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({arrVarNames, template, onClose}) => {
    const [currentTemplate] = useState<Template>(template || defaultTemplate);
    const [values, setValues] = React.useState<{ [key: string]: string }>(arrVarNames.reduce((acc, item) => {
        acc[item] = `{{${item}}}`;
        return acc;
    }, {} as {[name: string]: string}));

    const handleChange = (name: string, value: string) => {
        setValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const stringTemplate = serializeTemplate(currentTemplate);
    const variables = findVariablesInTemplate(stringTemplate, arrVarNames);

    const message = generateMessage(stringTemplate, values);
    const tpl = deserializeTemplate(message);

    const resolveIfBlocks = (node: IfThenElse): IfThenElse => {
        let resultIf = "";

        for (const child of node.children) {
            if (child.parent === BlockType.IF) {
                const resolvedChild = resolveIfBlocks(child);
                resultIf += resolvedChild.if
                    ? resolvedChild.then + resolvedChild.optional
                    : resolvedChild.else + resolvedChild.optional;
            }
        }

        const updatedNode: IfThenElse = {
            ...node,
            children: node.children.filter((child) => child.parent !== BlockType.IF),
            if: node.if + resultIf,
        };

        return updatedNode;
    };

    const renderIfThenElse = (node: IfThenElse) => (
        <React.Fragment key={node.id}>
            {node.if ? <p>{node.then}</p> : <p>{node.else}</p>}
            {node.children.map(child => renderIfThenElse(resolveIfBlocks(child)))}
            <p>{node.optional}</p>
        </React.Fragment>
    )

    return (
        <div className={styles.container}>
            <div className={styles.previewHeader}>Message Preview</div>
            <div className={styles.preview}>
                <p>{tpl.main}</p>
                {tpl.children.map(child => renderIfThenElse(child))}
            </div>
            <div className={styles.variables}>
                <span className={styles.varLabel}>Variables:</span>
                {variables.map((name, index) => (
                    <VariableInput
                        key={index}
                        name={name}
                        value={values[name] || ""}
                        onChange={(value) => handleChange(name, value)}
                    />
                ))}
            </div>
            <div className={styles.closeButtonDiv}>
                <button className={styles.closeButton} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default MessagePreview;
