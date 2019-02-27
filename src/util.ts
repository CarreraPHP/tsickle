/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// toArray is a temporary function to help in the use of
// ES6 maps and sets when running on node 4, which doesn't
// support Iterators completely.

import * as ts from 'typescript';

export function toArray<T>(iterator: Iterator<T>): T[] {
  const array: T[] = [];
  while (true) {
    const ir = iterator.next();
    if (ir.done) {
      break;
    }
    array.push(ir.value);
  }
  return array;
}

/**
 * Constructs a new ts.CompilerHost that overlays sources in substituteSource
 * over another ts.CompilerHost.
 *
 * @param substituteSource A map of source file name -> overlay source text.
 */
export function createSourceReplacingCompilerHost(
    substituteSource: Map<string, string>, delegate: ts.CompilerHost): ts.CompilerHost {
  return {
    getSourceFile,
    getCancellationToken: delegate.getCancellationToken,
    getDefaultLibFileName: delegate.getDefaultLibFileName,
    writeFile: delegate.writeFile,
    getCurrentDirectory: delegate.getCurrentDirectory,
    getCanonicalFileName: delegate.getCanonicalFileName,
    useCaseSensitiveFileNames: delegate.useCaseSensitiveFileNames,
    getNewLine: delegate.getNewLine,
    fileExists: delegate.fileExists,
    readFile: delegate.readFile,
    directoryExists: delegate.directoryExists,
    getDirectories: delegate.getDirectories,
  };

  function getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile|undefined {
    const path: string = ts.sys.resolvePath(fileName);
    const sourceText = substituteSource.get(path);
    if (sourceText !== undefined) {
      return ts.createSourceFile(fileName, sourceText, languageVersion);
    }
    return delegate.getSourceFile(path, languageVersion, onError);
  }
}

/**
 * Constructs a new ts.CompilerHost that overlays sources in substituteSource
 * over another ts.CompilerHost.
 *
 * @param outputFiles map to fill with source file name -> output text.
 */
export function createOutputRetainingCompilerHost(
    outputFiles: Map<string, string>, delegate: ts.CompilerHost): ts.CompilerHost {
  return <ts.CompilerHost>{
    getSourceFile: delegate.getSourceFile,
    getSourceFileByPath: delegate.getSourceFileByPath,
    getCancellationToken: delegate.getCancellationToken,
    getDefaultLibFileName: delegate.getDefaultLibFileName,
    getDefaultLibLocation: delegate.getDefaultLibLocation,
    writeFile,
    getCurrentDirectory: delegate.getCurrentDirectory,
    getDirectories: delegate.getDirectories,
    getCanonicalFileName: delegate.getCanonicalFileName,
    useCaseSensitiveFileNames: delegate.useCaseSensitiveFileNames,
    getNewLine: delegate.getNewLine,
    resolveModuleNames: delegate.resolveModuleNames,
    resolveTypeReferenceDirectives: delegate.resolveTypeReferenceDirectives,
    getEnvironmentVariable: delegate.getEnvironmentVariable,
    createHash: delegate.createHash
    // fileExists: delegate.fileExists,
    // readFile: delegate.readFile,
    // directoryExists: delegate.directoryExists,
  };

  function writeFile(
      fileName: string, content: string, writeByteOrderMark: boolean,
      onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]): void {
    outputFiles.set(fileName, content);
  }
}

/**
 * Returns the input string with line endings normalized to '\n'.
 */
export function normalizeLineEndings(input: string): string {
  return input.replace(/\r\n/g, '\n');
}
