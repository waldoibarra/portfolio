# Visual asset provenance

The homepage serves every image, icon, and font locally. No third-party request is required at
runtime.

| Asset | Origin | License and local notice |
| --- | --- | --- |
| `public/images/icons/brand-github.svg` | [Tabler outline GitHub](https://github.com/tabler/tabler-icons/blob/a4ce1404bc6d24d3c365afe7b258d6bf6f48d62d/icons/outline/brand-github.svg) | MIT, `public/images/icons/LICENSE` |
| `public/images/icons/brand-linkedin.svg` | [Tabler outline LinkedIn](https://github.com/tabler/tabler-icons/blob/a4ce1404bc6d24d3c365afe7b258d6bf6f48d62d/icons/outline/brand-linkedin.svg) | MIT, `public/images/icons/LICENSE` |
| `public/images/icons/brand-instagram.svg` | [Tabler outline Instagram](https://github.com/tabler/tabler-icons/blob/a4ce1404bc6d24d3c365afe7b258d6bf6f48d62d/icons/outline/brand-instagram.svg) | MIT, `public/images/icons/LICENSE` |
| `public/images/icons/brand-whatsapp.svg` | [Tabler outline WhatsApp](https://github.com/tabler/tabler-icons/blob/a4ce1404bc6d24d3c365afe7b258d6bf6f48d62d/icons/outline/brand-whatsapp.svg) | MIT, `public/images/icons/LICENSE` |
| `public/images/icons/mail.svg` | [Tabler outline mail](https://github.com/tabler/tabler-icons/blob/a4ce1404bc6d24d3c365afe7b258d6bf6f48d62d/icons/outline/mail.svg) | MIT, `public/images/icons/LICENSE` |
| `public/fonts/caveat-variable.ttf` | [Google Fonts Caveat variable font](https://github.com/google/fonts/blob/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/caveat/Caveat%5Bwght%5D.ttf) | SIL OFL 1.1, `public/fonts/OFL-Caveat.txt` |
| `public/images/journal/*.svg` | Original illustrations created for this portfolio | Project-owned artwork |

Tabler icons and Caveat were retrieved from the pinned upstream revisions above.
Their notices came from the pinned [Tabler MIT notice][tabler-license] and [Caveat OFL
notice][caveat-license].

[tabler-license]: https://github.com/tabler/tabler-icons/blob/a4ce1404bc6d24d3c365afe7b258d6bf6f48d62d/LICENSE
[caveat-license]: https://github.com/google/fonts/blob/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/caveat/OFL.txt
Brand trademarks are separate from the icon license. These contact links imply no endorsement.

## Generated artwork and approved portraits

The current homepage uses locally optimized derivatives of user-reviewed Higgsfield outputs.
The portraits are AI-assisted interpretations, not documentary photographs of the depicted scenes.
The library's artwork disclosure makes that distinction visible.
Original personal photographs and provider upload references are not included in public assets.

| Public asset | Source and model | Intended placement |
| --- | --- | --- |
| `personal/library-*.webp` | Soul ID base, refined with Nano Banana 2.1; job `9b113ea9-63f6-4319-867e-2bf19afc1cd8` | Library introduction |
| `personal/river-*.webp` | Nano Banana 2.1; job `9037eb72-ae63-44d2-aa90-ace4102534de` | Connect |
| `personal/courtyard-*.webp` | Soul ID base, refined with Nano Banana 2.1; job `3579580b-f91a-4d68-a609-5c1975ab8c7c` | Retired Connect portrait, retained for rollback |
| `worlds/workshop-*.webp` | Nano Banana 2.1; job `20a72e73-072f-4bce-9a92-d0e1caa7f704` | Workshop and directory |
| `worlds/observatory-*.webp` | Nano Banana 2.1; job `62c9d4b9-a284-43ff-9971-04a82a7df6c9` | Observatory and directory |
| `worlds/garden-*.webp` | Nano Banana 2.1; job `bb4a670b-8ee7-49d2-bb6f-e6c63caada8b` | Garden and directory |
| `worlds/crossroads-*.webp` | Nano Banana 2.1; job `f984fe09-3adc-45ec-b4e7-d8385e867e8a` | Crossroads and directory |
| `social-preview.jpg` | Approved library portrait with locally composed text | 1200 × 630 sharing image |

The four domain illustrations follow the approved banner's ink, gouache, and connected-world visual
language.
Forests and natural water reflect Waldo's explicit preferences.
Their scenes express interests symbolically, not witnessed events or travel records.
Generated output provenance does not imply a third-party license grant or guaranteed exclusivity.

### Reproduce the optimized assets

The local image workspace is `~/projects/prototypes/waldo-profile/`.
Its manifests retain prompts, source references, generated masters, review decisions, and provider
costs.
The source workspace remains separate from the deployed portfolio.
Connect uses the approved full seated composition from `outputs/current-review/instagram.png`,
not its avatar crop.
The library and world masters now live under `archive/2026-11-14-earlier-rounds/outputs/`.
The reproduction script uses those archived paths without changing the selected artwork.

Run the recipe with an existing Sharp module installation:

```sh
just prepare-visual-assets /path/to/waldo-profile /path/to/node_modules/sharp
```

The recipe does not install dependencies or contact a provider.
It creates responsive WebP files and rebuilds the sharing JPEG, stripping unnecessary metadata.
Sharp 0.35.4 was exercised for this revision; it is an external artwork tool, not a website
dependency.
Review the portrait crop and sharing image after regeneration.

The library portrait has 640, 960, and 1600 pixel variants.
The river portrait has 640 and 960 pixel variants, preserving the complete square composition.
The retired courtyard variants remain available but are no longer regenerated.
Each world has 320, 640, and 1280 pixel variants, cropped to 4:3 without distortion.
The smallest variants serve compact mobile thumbnails.
Earlier SVGs and the original portrait remain available as prior assets, not active homepage
imagery.
