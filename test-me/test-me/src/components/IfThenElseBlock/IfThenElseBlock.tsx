import React from "react";
import {BlockType, IfThenElse} from "../../types";
import ResizableTextarea from "../ResizableTextarea/ResizableTextarea";
import styles from "./IfThenElseBlock.module.css";

interface IfThenElseProps {
    template: IfThenElse
    onDelete: (id: string, parent: BlockType, optionalValue: string) => void;
    onChange: (id: string | null, blockType: BlockType, value: string) => void;
    nested?: boolean;
}

const IfThenElseBlock: React.FC<IfThenElseProps> = ({template, onDelete, onChange, nested = false}) => {
    const handleIfChange = (value: string) => {
        onChange(template.id, BlockType.IF, value);
    };
    const handleThenChange = (value: string) => {
        onChange(template.id, BlockType.THEN, value);
    };

    const handleElseChange = (value: string) => {
        onChange(template.id, BlockType.ELSE, value);
    };

    const handleOptionalChange = (value: string) => {
        onChange(template.id, BlockType.OPTIONAL, value);
    };

    const handleOnDelete = () => {
        onDelete(template.id, template.parent, template.optional);
    };

    const children = template.children || [];

    const nestedIfThenElseBlocks = children.reduce((acc, item) => {
        const rest = acc.has(item.parent) ? acc.get(item.parent) : [];
        acc.set(item.parent, [...rest, item]);
        return acc;
    }, new Map());

    return (
        <div className={styles.ifThenElse + (nested ? ` ${styles.nestedIfThenElse}` : "")}>
            <div className={styles.blockWithNested}>
                <div className={styles.block + (nested ? ` ${styles.nestedBlock}` : "")}>
                    <div>
                        <span className={styles.blockName}>IF</span>
                        <button className={styles.deleteButton} onClick={handleOnDelete}>Delete</button>
                    </div>
                    <ResizableTextarea
                        value={template.if}
                        onChange={handleIfChange}
                        dataId={template.id}
                        dataBlockType={BlockType.IF}
                    />
                </div>
                {
                    (nestedIfThenElseBlocks.has(BlockType.IF)) ?
                        nestedIfThenElseBlocks.get(BlockType.IF).map((tpl: IfThenElse) => (
                            <React.Fragment key={tpl.id}>
                                <IfThenElseBlock template={tpl} onDelete={onDelete} onChange={onChange} nested={true}/>
                            </React.Fragment>
                        )) : null
                }
            </div>
            <div className={styles.blockWithNested}>
                <div className={styles.block + (nested ? ` ${styles.nestedBlock}` : "")}>
                    <span>THEN</span>
                    <ResizableTextarea
                        value={template.then}
                        onChange={handleThenChange}
                        dataId={template.id}
                        dataBlockType={BlockType.THEN}
                    />
                </div>
                {
                    (nestedIfThenElseBlocks.has(BlockType.THEN)) ?
                        nestedIfThenElseBlocks.get(BlockType.THEN).map((tpl: IfThenElse) => (
                            <React.Fragment key={tpl.id}>
                                <IfThenElseBlock template={tpl} onDelete={onDelete} onChange={onChange} nested={true}/>
                            </React.Fragment>
                        )) : null
                }
            </div>
            <div className={styles.blockWithNested}>
                <div className={styles.block + (nested ? ` ${styles.nestedBlock}` : "")}>
                    <span>ELSE</span>
                    <ResizableTextarea
                        value={template.else}
                        onChange={handleElseChange}
                        dataId={template.id}
                        dataBlockType={BlockType.ELSE}
                    />
                </div>
                {
                    (nestedIfThenElseBlocks.has(BlockType.ELSE)) ?
                        nestedIfThenElseBlocks.get(BlockType.ELSE).map((tpl: IfThenElse) => (
                            <React.Fragment key={tpl.id}>
                                <IfThenElseBlock template={tpl} onDelete={onDelete} onChange={onChange} nested={true}/>
                            </React.Fragment>
                        )) : null
                }
            </div>
            <div className={styles.blockWithNested}>
                <div className={styles.optionalBlock}>
                    <ResizableTextarea
                        value={template.optional}
                        onChange={handleOptionalChange}
                        dataId={template.id}
                        dataBlockType={BlockType.OPTIONAL}
                    />
                </div>
                {
                    (nestedIfThenElseBlocks.has(BlockType.OPTIONAL)) ?
                        nestedIfThenElseBlocks.get(BlockType.OPTIONAL).map((tpl: IfThenElse) => (
                            <React.Fragment key={tpl.id}>
                                <IfThenElseBlock template={tpl} onDelete={onDelete} onChange={onChange} nested={true}/>
                            </React.Fragment>
                        )) : null
                }
            </div>
        </div>
    );
};

export default IfThenElseBlock;
