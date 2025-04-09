import React, {useEffect, useRef} from "react";
import {useMessageTemplateContext} from "../MessageTemplateEditor/MessageTemplateContext";
import {BlockType} from "../../types";
import styles from "./ResizableTextarea.module.css";

interface ResizableTextareaProps {
    value: string;
    onChange: (value: string) => void;
    dataId: string | null;
    dataBlockType: BlockType;
}

const ResizableTextarea: React.FC<ResizableTextareaProps> = ({ value, onChange, dataId, dataBlockType}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { setActiveRef } = useMessageTemplateContext()

    useEffect(() => {
        updateTextareaHeight();
    }, [value]);

    useEffect(() => {
        if (textareaRef.current && (dataBlockType === BlockType.MAIN || dataBlockType === BlockType.IF)) {
            textareaRef.current.focus();
        }
    }, [textareaRef, dataBlockType]);


    const updateTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    };

    const handleOnFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setActiveRef(textareaRef);
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const nested = (dataBlockType === BlockType.MAIN || dataBlockType === BlockType.OPTIONAL) ? '' : ` ${styles.nested}`;

    return (
        <textarea
            className={styles.textArea + nested}
            ref={textareaRef}
            value={value}
            onChange={handleOnChange}
            onFocus={handleOnFocus}
            data-id={dataId}
            data-blocktype={dataBlockType}
            placeholder={dataBlockType}
        />
    );
};

export default ResizableTextarea;
