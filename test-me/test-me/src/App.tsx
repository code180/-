import React, {useState} from "react";
import {deserializeTemplate, deserializeVariableNames, serializeTemplate} from "./utils";
import {Template} from "./types";
import {MessageTemplateProvider} from "./components/MessageTemplateEditor/MessageTemplateContext";
import MessageTemplateEditor from "./components/MessageTemplateEditor/MessageTemplateEditor";

const App: React.FC = () => {
    const [showMessageEditor, setShowMessageEditor] = useState<boolean>(false);
    const [template, setTemplate] = useState<Template | null>(localStorage.template ? deserializeTemplate(localStorage.template) : null);

    const handleOpenMessageTemplate = () => {
        setShowMessageEditor(true);
    };

    const handleCloseMessageTemplate = () => {
        setShowMessageEditor(false);
    };

    const handleSaveTemplate = (template: Template) => {
        localStorage.setItem("template", serializeTemplate(template));
        setTemplate(template);
        window.alert("Сохранен!");
    };

    const arrVarNames = localStorage.arrVarNames ? deserializeVariableNames(localStorage.arrVarNames) : ["firstname", "lastname", "company", "position"];

    return (
        <div>
            {showMessageEditor ? (
                <MessageTemplateProvider>
                    <MessageTemplateEditor
                        arrVarNames={arrVarNames}
                        template={template}
                        onSaveTemplate={handleSaveTemplate}
                        onClose={handleCloseMessageTemplate}
                    />
                </MessageTemplateProvider>
            ) : <button onClick={handleOpenMessageTemplate}>Message Editor</button>

            }
        </div>
    );
};

export default App;
