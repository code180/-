export const enum BlockType {
    MAIN = 'main',
    OPTIONAL = 'optional',
    IF = 'if',
    THEN = 'then',
    ELSE = 'else',
    Optional = 'optional',
}

export interface Template {
    main: string;
    children: IfThenElse[];
}

export interface IfThenElse {
    id: string;
    parent: BlockType
    if: string;
    then: string;
    else: string;
    optional: string;
    children: IfThenElse[];
}