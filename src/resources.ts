import { ImageSource, Loader } from 'excalibur';

export const Resources = {
   Forest: new ImageSource('./images/forest.png'),
   Player: new ImageSource('./images/player.png'),
} as const;

// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader
export const loader = new Loader();

loader.logo = 'data:image/png;base64,'
   + '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'
   + 'gg==';

loader.logoHeight = 65;
loader.logoWidth = 228;

for (const res of Object.values(Resources)) {
   loader.addResource(res);
}
