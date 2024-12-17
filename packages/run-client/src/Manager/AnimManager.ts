let animatiion = true;

const hasAnimation = () => {
  return animatiion;
};

const pauseAnimation = () => {
  animatiion = false;
};

const resumeAnimation = () => {
  animatiion = true;
};

export { hasAnimation, pauseAnimation, resumeAnimation };
