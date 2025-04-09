import React from "react";
import styles from "./VariableButton.module.css";

interface VariableButtonProps {
    name: string;
    onClick: (variable: string) => void;
}

const VariableButton: React.FC<VariableButtonProps> = ({ name, onClick }) => {
    const handleClick = () => {
        onClick(`{${name}}`);
    };

    return <button className={styles.variableButton} onClick={handleClick}>{"{" + name + "}"}</button>;
};

export default VariableButton;
