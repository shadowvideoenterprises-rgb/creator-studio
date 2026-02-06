export type PillarStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Coming Soon';

export const getIdeateStatus = (project: any): PillarStatus => {
  if (project.title && project.title.length > 0) {
    return 'Complete';
  }
  return 'Not Started';
};

export const getWriteStatus = (project: any): PillarStatus => {
  if (project.content && project.content.length > 0) {
    return 'Complete';
  }
  return 'Not Started';
};

export const getVisualizeStatus = (project: any): PillarStatus => {
  if (project.scenes && project.scenes.length > 0) {
    const allScenesHaveAssets = project.scenes.every((scene: any) => scene.assets && scene.assets.length > 0);
    if (allScenesHaveAssets) {
      return 'Complete';
    }
    const someScenesHaveAssets = project.scenes.some((scene: any) => scene.assets && scene.assets.length > 0);
    if (someScenesHaveAssets) {
        return 'In Progress';
    }
  }
  return 'Not Started';
};

export const getLaunchStatus = (): PillarStatus => {
  return 'Coming Soon';
};
