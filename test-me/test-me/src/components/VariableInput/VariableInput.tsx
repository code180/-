import React from "react";
import styles from "./VariableInput.module.css";

interface VariableInputProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
}

const VariableInput: React.FC<VariableInputProps> = ({name, value, onChange}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{name}</label>
            <input
                className={styles.input}
                type="text"
                defaultValue={value || `{{${name}}}`}
                onChange={handleChange}
                placeholder={name}
            />
        </div>
    );
};

export default VariableInput;
