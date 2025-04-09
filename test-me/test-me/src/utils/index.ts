import {Template} from "../types";

type TemplateValues = { [name: string]: string };

export const generateUniqueId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export const generateMessage = (template: string, values: TemplateValues): string => {
    const variables = template.match(/{{\w+}}/g);
    if (!variables) {
        return template;
    }

    let generatedMessage = template;
    variables.forEach((variable) => {
        const name = variable.slice(2, -2);
        const value = values[name] || "";
        generatedMessage = generatedMessage.replace(variable, value);
    });

    return generatedMessage;
};

export const serializeTemplate = (template: Template): string => {
    return JSON.stringify(template);
};

export const deserializeTemplate = (templateString: string): Template => {
    try {
        return JSON.parse(templateString);
    } catch (error) {
        console.error("Error parsing template:", error);
        return {
            main: "",
            children: [],
        };
    }
};

export const serializeVariableNames = (arrVarNames: string[]): string => {
    return JSON.stringify(arrVarNames);
};

export const deserializeVariableNames = (variableNamesString: string): string[] => {
    try {
        return JSON.parse(variableNamesString);
    } catch (error) {
        console.error("Error parsing variable names:", error);
        return [];
    }
};

export const findVariablesInTemplate = (template: string, arrVarNames: string[]): string[] => {
    const regex = /\{\{([^\s}]+)\}\}/g;
    const variables = template.match(regex) || [];
    const uniqueVariables = new Set(variables.map((variable) => variable.slice(2, -2)));

    // Filter out variables not present in arrVarNames
    return Array.from(uniqueVariables).filter((variable) => arrVarNames.includes(variable));
}
