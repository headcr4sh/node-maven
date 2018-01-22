/*
 * Copyright (C) 2015-2016 Benjamin P. Jung.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Options to be used when creating new Maven wrapper instances.
 */
type MavenOptions = {
    /** Working directory (Default is: <code>process.cwd()</code>) */
    cwd?: string,
    /** Maven executable relative to <code>cwd</code>. Default is './mvnw' if the mvnw executable is in your project root. 
     * Otherwise, default is 'mvn' or 'mvn.bat' when using Windows. */
    cmd?: string,
    /** Filename of the POM. (Results in <code>-f ${file}</code>) */
    file?: string,
    /** Filename of settings.xml to be used (Results in <code>-s ${setings}</code>) */
    settings?: string,
    /** List of profiles to be enabled or disabled. */
    profiles?: string[],
    /** Quiet output - only show errors if set to <code>true</code>. */
    quiet?: boolean,
    /** Produce execution debug output if set to <code>true</code>. */
    debug?: boolean,
    /** Forces a check for missing releases and updated snapshots on remote repositories. Defaults to <code>false</code>. */
    updateSnapshots?: boolean,
    /** Produce execution offline if set to <code>true</code>. */
    offline?: boolean,
    /** Prevents Maven from building submodules if set to <code>true</code>. */
    nonRecursive?: boolean,
    /** Thread count, for instance 2.0C where C is core multiplied */
    threads?: number
};

/**
 * Maven wrapper.
 */
interface Maven {

    /**
     * Creates a new Maven wrapper instance.
     * @param options
     *     Configuration options.
     * @returns
     *   A new Maven wrapper instance.
     */
    create(opts?: MavenOptions): Maven;

    /**
     * Executes one or more Maven commands.
     * @param commands
     *     A list of commands to be executed or a single command.
     * @param defines
     *     List of defines that will be passed to the Java VM via
     *     <code>-Dkey=value</code>
     */
    execute(commands, defines): Promise<any>;

}

export default Maven;
