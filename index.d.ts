/**
 * @throws {Error} Throws an exception if some directory inside one of the path
 * contains JS or TS modules, the names of which differ only in case.
 */
export declare const assertModulesSupportCaseInsensitiveFS: (paths: string[]) => void;
export default assertModulesSupportCaseInsensitiveFS;
