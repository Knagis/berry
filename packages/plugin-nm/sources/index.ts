import {Hooks, Plugin, SettingsType, WindowsLinkType} from '@yarnpkg/core';
import {xfs}                                          from '@yarnpkg/fslib';
import {NodeModulesHoistingLimits}                    from '@yarnpkg/nm';

import {NodeModulesLinker, NodeModulesMode}           from './NodeModulesLinker';
import {getGlobalHardlinksStore}                      from './NodeModulesLinker';

// import {PnpLooseLinker}                     from './PnpLooseLinker';

export {NodeModulesLinker};
export {NodeModulesMode};
//export {PnpLooseLinker};

export enum NodePackageMapType {
  STANDARD = `standard`,
  LOOSE = `loose`,
}

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {
    nmHoistingLimits: NodeModulesHoistingLimits;
    nmMode: NodeModulesMode;
    nmSelfReferences: boolean;
  }
}

const plugin: Plugin<Hooks> = {
  hooks: {
    cleanGlobalArtifacts: async configuration => {
      const globalHardlinksDirectory = getGlobalHardlinksStore(configuration);
      await xfs.removePromise(globalHardlinksDirectory);
    },
  },
  configuration: {
    nodeLinker: {
      description: `The linker used for installing Node packages, one of: "pnp", "pnpm", or "node-modules"`,
      type: SettingsType.STRING,
      default: `pnp`,
    },
    nodePackageMapType: {
      description: `If 'standard', package maps will reflect the dependency graph. If 'loose', they will reflect the hoisted node_modules layout.`,
      type: SettingsType.STRING,
      values: [
        NodePackageMapType.STANDARD,
        NodePackageMapType.LOOSE,
      ],
      default: NodePackageMapType.STANDARD,
    },
    winLinkType: {
      description: `Whether Yarn should use Windows Junctions or symlinks when creating links on Windows.`,
      type: SettingsType.STRING,
      values: [
        WindowsLinkType.JUNCTIONS,
        WindowsLinkType.SYMLINKS,
      ],
      default: WindowsLinkType.JUNCTIONS,
    },
    nmHoistingLimits: {
      description: `Prevents packages to be hoisted past specific levels`,
      type: SettingsType.STRING,
      values: [
        NodeModulesHoistingLimits.WORKSPACES,
        NodeModulesHoistingLimits.DEPENDENCIES,
        NodeModulesHoistingLimits.NONE,
      ],
      default: NodeModulesHoistingLimits.NONE,
    },
    nmMode: {
      description: `Defines in which measure Yarn must use hardlinks and symlinks when generated \`node_modules\` directories.`,
      type: SettingsType.STRING,
      values: [
        NodeModulesMode.CLASSIC,
        NodeModulesMode.HARDLINKS_LOCAL,
        NodeModulesMode.HARDLINKS_GLOBAL,
      ],
      default: NodeModulesMode.CLASSIC,
    },
    nmSelfReferences: {
      description: `Defines whether the linker should generate self-referencing symlinks for workspaces.`,
      type: SettingsType.BOOLEAN,
      default: true,
    },
  },
  linkers: [
    NodeModulesLinker,
    // PnpLooseLinker,
  ],
};

// eslint-disable-next-line arca/no-default-export
export default plugin;
