import React, {useEffect, useState} from "react";
import VariableButton from "../VariableButton/VariableButton";
import {BlockType, IfThenElse, Template} from "../../types";
import {defaultTemplate} from "../../constants";
import ResizableTextarea from "../ResizableTextarea/ResizableTextarea";
import {generateUniqueId, serializeTemplate} from "../../utils";
import {useMessageTemplateContext} from "./MessageTemplateContext";
import IfThenElseBlock from "../IfThenElseBlock/IfThenElseBlock";
import styles from "./MessageTemplateEditor.module.css";
import MessagePreview from "../MessagePreview/MessagePreview";


interface MessageTemplateEditorProps {
    arrVarNames: string[];
    template: Template | null;
    onSaveTemplate: (template: Template) => void;
    onClose: () => void;
}

const MessageTemplateEditor: React.FC<MessageTemplateEditorProps> = ({
                                                                         arrVarNames,
                                                                         template,
                                                                         onSaveTemplate,
                                                                         onClose
                                                                     }) => {
    const [currentTemplate, setCurrentTemplate] = useState<Template>(template || defaultTemplate);
    const [showPreview, setShowPreview] = useState<boolean>(false);


    const {activeRef} = useMessageTemplateContext()

    useEffect(() => {
        if (activeRef && activeRef.current) {
            activeRef.current.focus();
        }
    }, [activeRef]);

    const handleVariableClick = (variable: string) => {
        if (activeRef?.current) {
            const {startPosition, id, blockType} = getDataFromNode(activeRef.current);

            handleTemplateChange(id, blockType, `{${variable}}`, true, startPosition);
            const newCursorPos = startPosition + variable.length + 2;
            activeRef.current.setSelectionRange(newCursorPos, newCursorPos);
            activeRef.current.focus();
        }
    };

    const handleTemplateChange = (id: string | null, blockType: BlockType, value: string, insert: boolean = false, starPos: number = 0) => {
        if (id) {
            setCurrentTemplate((currentTemplate) => {
                const findAndChangeValue = (items: IfThenElse[]): IfThenElse[] => {
                    return items.map((item) => {
                        if (item.id === id && blockType !== BlockType.MAIN) {
                            const oldValue = item[blockType];
                            const newValue = insert ? oldValue.slice(0, starPos) + value + oldValue.slice(starPos) : value;
                            // Found the target IfThenElseBlock, add new children to it
                            return {
                                ...item,
                                [blockType]: newValue,
                            };
                        } else if (item.children && item.children.length > 0) {
                            return {
                                ...item,
                                children: findAndChangeValue(item.children),
                            };
                        }
                        return item;
                    });
                };

                const res = findAndChangeValue(currentTemplate.children);

                return {
                    ...currentTemplate,
                    children: res,
                };
            });
        } else {
            setCurrentTemplate(currentTemplate => {
                const oldValue = currentTemplate[BlockType.MAIN];
                const newValue = insert ? oldValue.slice(0, starPos) + value + oldValue.slice(starPos) : value;

                return {
                    ...currentTemplate,
                    [blockType]: newValue,
                }
            })
        }
    };

    const handleMainChange = (value: string) => {
        handleTemplateChange(null, BlockType.MAIN, value);
    };

    const handleDelete = (id: string, parentProperty: BlockType, optionalValue: string) => {
        setCurrentTemplate((currentTemplate) => {
            if (parentProperty === BlockType.MAIN) {
                if (currentTemplate.children.length > 1) {
                    const indexFound = currentTemplate.children.findIndex(item => item.id === id);
                    if (indexFound > 0) {
                        return {
                            ...currentTemplate,
                            children: currentTemplate.children
                                .map((item, index) => {
                                    if (indexFound - 1 === index) {
                                        return {
                                            ...item,
                                            optional: item.optional + optionalValue,
                                        }
                                    }
                                    return item;
                                })
                                .filter(item => item.id !== id),
                        };
                    }
                }
                return {
                    ...currentTemplate,
                    [parentProperty]: currentTemplate[parentProperty] + optionalValue,
                    children: currentTemplate.children.filter(item => item.id !== id),
                };
            } else {
                const findAndDelete = (items: IfThenElse[]): IfThenElse[] => {
                    const indexFound = items.findIndex(item => item.id === id);
                    return items.map((item, index) => {
                        if (indexFound !== -1 && (indexFound - 1 === index)) {
                            return {
                                ...item,
                                optional: item.optional + optionalValue,
                            };
                        }
                        if (item.id === id) {
                            return null;
                        } else if (item.children && item.children.length > 0) {
                            const length = item.children.length;
                            const result = findAndDelete(item.children);
                            if (length !== result.length && !result.length) {
                                return {
                                    ...item,
                                    children: result,
                                    [parentProperty]: item[parentProperty] + optionalValue,
                                };
                            } else {
                                return {
                                    ...item,
                                    children: result,
                                }
                            }

                        }
                        return item;
                    }).filter(Boolean) as IfThenElse[];
                };
                const res = findAndDelete(currentTemplate.children);
                return {
                    ...currentTemplate,
                    children: res,
                };
            }
        });
    };

    const handleSave = () => {
        onSaveTemplate(currentTemplate);
    };

    const handleClose = () => {
        if (template && serializeTemplate(currentTemplate) === serializeTemplate(template)) {
            onClose();
        } else {
            const shouldSaveChanges = window.confirm("Сохранить изменения перед закрытием?");
            if (shouldSaveChanges) {
                handleSave();
            } else {
                onClose();
            }
        }
    };

    const getDataFromNode = (current: HTMLTextAreaElement): {
        beforeCursor: string,
        afterCursor: string,
        startPosition: number,
        id: string | null,
        blockType: BlockType,
    } => {
        let beforeCursor: string = "";
        let afterCursor: string = "";

        const startPosition = current.selectionStart || 0;

        const id = current.getAttribute("data-id");
        const blockType = current.getAttribute("data-blocktype") as BlockType;

        if (id) {
            const findBlock = (items: IfThenElse[]): IfThenElse | null => {
                const foundItem = items.find((item) => item.id === id);
                if (foundItem) {
                    return foundItem;
                }

                for (const item of items) {
                    if (item.children && item.children.length > 0) {
                        const nestedFoundItem = findBlock(item.children);
                        if (nestedFoundItem) {
                            return nestedFoundItem;
                        }
                    }
                }

                return null;
            }

            const block = findBlock(currentTemplate.children);
            if (block && blockType !== BlockType.MAIN) {
                beforeCursor = block[blockType].slice(0, startPosition);
                afterCursor = block[blockType].slice(startPosition);
            }
        } else {
            beforeCursor = currentTemplate.main.slice(0, startPosition);
            afterCursor = currentTemplate.main.slice(startPosition);
        }

        return {
            beforeCursor,
            afterCursor,
            startPosition,
            id,
            blockType,
        }
    }

    const handleAddIfThenElse = () => {
        if (activeRef?.current) {
            const {beforeCursor, afterCursor, id, blockType} = getDataFromNode(activeRef.current)

            if (id) {
                setCurrentTemplate((currentTemplate) => {
                    const findAndAddChildren = (items: IfThenElse[]): IfThenElse[] => {
                        const indexFound = items.findIndex(i => i.id === id);
                        const itemFound = items.find(i => i.id === id);
                        if (indexFound !== -1 && itemFound && blockType === BlockType.OPTIONAL && itemFound.parent === BlockType.MAIN) {
                            const resultArr = [...items];
                            resultArr.splice(indexFound + 1, 0, {
                                id: generateUniqueId(),
                                parent: itemFound.parent,
                                if: "",
                                then: "",
                                else: "",
                                optional: afterCursor,
                                children: [],
                            });
                            resultArr[indexFound].optional = beforeCursor;
                            return resultArr;
                        }
                        return items.map((item) => {
                            if (item.id === id && blockType !== BlockType.OPTIONAL) {
                                return {
                                    ...item,
                                    children: [
                                        {
                                            id: generateUniqueId(),
                                            parent: blockType,
                                            if: "",
                                            then: "",
                                            else: "",
                                            optional: afterCursor,
                                            children: [],
                                        },
                                        ...item.children,
                                    ],
                                    [blockType]: beforeCursor,
                                };
                            } else if (item.children && item.children.length > 0) {
                                const indexFound = item.children.findIndex(i => i.id === id);
                                const itemFound = item.children.find(i => i.id === id);
                                if (indexFound !== -1 && itemFound && blockType === BlockType.OPTIONAL) {
                                    const resultArr = [...findAndAddChildren(item.children)];
                                    resultArr.splice(indexFound + 1, 0, {
                                        id: generateUniqueId(),
                                        parent: itemFound.parent,
                                        if: "",
                                        then: "",
                                        else: "",
                                        optional: afterCursor,
                                        children: [],
                                    });
                                    resultArr[indexFound].optional = beforeCursor;
                                    return {
                                        ...item,
                                        children: resultArr,
                                    };
                                } else {
                                    return {
                                        ...item,
                                        children: findAndAddChildren(item.children),
                                    };
                                }
                            }
                            return item;
                        });
                    };

                    const res = findAndAddChildren(currentTemplate.children);

                    return {
                        ...currentTemplate,
                        children: res,
                    };
                });
            } else {
                setCurrentTemplate(currentTemplate => ({
                    ...currentTemplate,
                    main: beforeCursor,
                    children: [
                        {
                            id: generateUniqueId(),
                            parent: blockType,
                            if: "",
                            then: "",
                            else: "",
                            optional: afterCursor,
                            children: [],
                        },
                        ...currentTemplate.children,
                    ]
                }))
            }
        }
    }

    const handleOpenPreview = () => {
        setShowPreview(true);
    };
    const handleClosePreview = () => {
        setShowPreview(false);
    };

    return (
        <>
            {showPreview && (
                <div className={styles.previewContainer}>
                    <MessagePreview
                        arrVarNames={arrVarNames}
                        template={currentTemplate}
                        onClose={handleClosePreview}
                    />
                </div>
            )}
            <div className={styles.editorContainer}>
                <div className={styles.editorHeader}>
                    <div className={styles.variableButtons}>
                        {arrVarNames.map((name) => (
                            <VariableButton key={name} name={name} onClick={handleVariableClick}/>
                        ))}
                    </div>
                    <div className={styles.addIfThenElse}>
                        <button onClick={handleAddIfThenElse}>[IF-THEN-ELSE]</button>
                    </div>
                </div>
                <div className={styles.editorBlocks}>
                    <ResizableTextarea value={currentTemplate.main} onChange={handleMainChange} dataId={null}
                                       dataBlockType={BlockType.MAIN}/>
                    {
                        currentTemplate.children.length ?
                            currentTemplate.children.map((tpl) => (
                                <React.Fragment key={tpl.id}>
                                    <IfThenElseBlock template={tpl} onDelete={handleDelete}
                                                     onChange={handleTemplateChange}/>
                                </React.Fragment>
                            )) : null
                    }
                </div>
                <div className={styles.controlButtons}>
                    <button onClick={handleOpenPreview}>Preview</button>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleClose}>Close</button>
                </div>
            </div>
        </>
    );
};

export default MessageTemplateEditor;

