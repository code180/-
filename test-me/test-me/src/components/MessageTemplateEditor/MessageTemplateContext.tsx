import React, {useContext, useRef} from "react";

export interface MessageTemplateContextData {
    activeRef: React.RefObject<HTMLTextAreaElement> | null;
    setActiveRef: (ref: React.RefObject<HTMLTextAreaElement> | null) => void;
}

const MessageTemplateContext = React.createContext<MessageTemplateContextData>({
    activeRef: null,
    setActiveRef: () => {},
});

export const useMessageTemplateContext = () => useContext(MessageTemplateContext);

interface MessageTemplateProviderProps {
    children: React.ReactNode;
}

export const MessageTemplateProvider: React.FC<MessageTemplateProviderProps> = ({ children }) => {
    const activeRef = useRef<HTMLTextAreaElement | null>(null);

    const setActiveRef = (ref: React.RefObject<HTMLTextAreaElement> | null) => {
        activeRef.current = ref ? ref.current : null;
    };

    const contextValue: MessageTemplateContextData = {
        activeRef,
        setActiveRef,
    };

    return (
        <MessageTemplateContext.Provider value={contextValue}>
            {children}
        </MessageTemplateContext.Provider>
    );
};
