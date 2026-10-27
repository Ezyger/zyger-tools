declare module 'imagetracerjs' {
  interface TraceOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    rightangleenhance?: boolean;
    strokewidth?: number;
    roundcoords?: number;
    viewbox?: boolean;
    desc?: boolean;
    blurradius?: number;
    pal?: { r: number; g: number; b: number; a: number }[];
  }
  const tracer: {
    imagedataToSVG(image: Pick<ImageData, 'data' | 'width' | 'height'>, options?: TraceOptions): string;
  };
  export default tracer;
}
