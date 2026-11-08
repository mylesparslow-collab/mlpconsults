/* Halden demo catalogue. Each ring is a Ring Studio config; photos in img/ are rendered from these by tools/render.js.
   Edit here, re-render, and paste the returned prices into PRICES at the bottom. */
window.METALS = [
  { k: 'plat', label: 'Platinum', swatch: 'linear-gradient(135deg, #f4f5f7 0%, #b9bec6 45%, #eef0f2 60%, #9ea4ad 100%)' },
  { k: 'y18', label: '18k Yellow Gold', swatch: 'linear-gradient(135deg, #f6e2a8 0%, #c9993f 45%, #f0d48c 60%, #a87a2c 100%)' },
  { k: 'r14', label: '14k Rose Gold', swatch: 'linear-gradient(135deg, #f6d7c8 0%, #c98a72 45%, #efc4b0 60%, #a8664f 100%)' },
];
window.PRODUCTS = [
  { id: 'wren', name: 'The Wren', cat: 'engagement', style: 'Solitaire', stone: 'diamond', line: 'A long oval on four slim claws. Nothing between you and the stone.',
    cfg: { shape: 'oval', ct: 2, ratio: 1.42, center: 'diamond', head: 'prong4', accent: 'none', band: 'plain', bandW: 1.7 } },
  { id: 'ines', name: 'The Ines', cat: 'engagement', style: 'Pavé', stone: 'diamond', line: 'A round brilliant held by six prongs over a band of tiny diamonds.',
    cfg: { shape: 'round', ct: 1.5, center: 'diamond', head: 'prong6', accent: 'none', band: 'pave', bandW: 1.8, bandStone: 'diamond' } },
  { id: 'celeste', name: 'The Celeste', cat: 'engagement', style: 'Halo', stone: 'diamond', line: 'A soft cushion framed in a ring of brilliants, so it faces up larger.',
    cfg: { shape: 'cushion', ct: 2, ratio: 1.05, center: 'diamond', head: 'prong4', accent: 'halo', accentStone: 'diamond', band: 'plain', bandW: 1.8 } },
  { id: 'margot', name: 'The Margot', cat: 'engagement', style: 'Three-stone', stone: 'diamond', line: 'An emerald cut between two tapered baguettes. Art deco, quietly.',
    cfg: { shape: 'emerald', ct: 2, ratio: 1.45, center: 'diamond', head: 'prong4', accent: 'side', accentShape: 'baguette', accentStone: 'diamond', accentCt: .3, band: 'plain', bandW: 1.9 } },
  { id: 'oriel', name: 'The Oriel', cat: 'engagement', style: 'Hidden halo', stone: 'diamond', line: 'A pear that reads as a solitaire until she turns her hand.',
    cfg: { shape: 'pear', ct: 1.75, ratio: 1.55, center: 'diamond', head: 'prong4', accent: 'hidden', accentStone: 'diamond', band: 'split', bandW: 1.8 } },
  { id: 'sloane', name: 'The Sloane', cat: 'engagement', style: 'Solitaire', stone: 'diamond', line: 'A three-carat radiant on a knife-edge band. Built to catch the room.',
    cfg: { shape: 'radiant', ct: 3, ratio: 1.3, center: 'diamond', head: 'claw', accent: 'none', band: 'knife', bandW: 1.8 } },
  { id: 'vesper', name: 'The Vesper', cat: 'engagement', style: 'Bezel', stone: 'diamond', line: 'A round diamond in a closed rim of metal, on a twisted shank. Made for hands that work.',
    cfg: { shape: 'round', ct: 1.25, center: 'diamond', head: 'bezel', accent: 'none', band: 'twist', bandW: 2 } },
  { id: 'asha', name: 'The Asha', cat: 'engagement', style: 'Pavé', stone: 'diamond', line: 'A square Asscher on compass prongs, over a pavé band.',
    cfg: { shape: 'asscher', ct: 2, center: 'diamond', head: 'compass', accent: 'none', band: 'pave', bandW: 1.8, bandStone: 'diamond' } },
  { id: 'juno', name: 'The Juno', cat: 'sapphire', style: 'Toi et moi', stone: 'sapphire', line: 'Two stones, two of you: an oval diamond beside a cornflower pear sapphire.',
    cfg: { shape: 'oval', ct: 1.5, ratio: 1.4, center: 'diamond', head: 'prong4', accent: 'toi', accentShape: 'pear', accentStone: 'corn', accentCt: 1, band: 'plain', bandW: 1.7 } },
  { id: 'regent', name: 'The Regent', cat: 'sapphire', style: 'Three-stone', stone: 'sapphire', line: 'A royal-blue oval sapphire between two pear diamonds, points turned in.',
    cfg: { shape: 'oval', ct: 2, ratio: 1.38, center: 'royal', head: 'prong4', accent: 'side', accentShape: 'pear', accentStone: 'diamond', accentCt: .5, band: 'plain', bandW: 1.8 } },
  { id: 'aurora', name: 'The Aurora', cat: 'sapphire', style: 'Halo', stone: 'sapphire', line: 'A sunset padparadscha cushion inside a halo of white diamonds.',
    cfg: { shape: 'cushion', ct: 1.75, ratio: 1.05, center: 'padpa', head: 'prong4', accent: 'halo', accentStone: 'diamond', band: 'plain', bandW: 1.8 } },
  { id: 'tide', name: 'The Tide', cat: 'sapphire', style: 'Bezel', stone: 'sapphire', line: 'A teal marquise set east to west in a clean bezel.',
    cfg: { shape: 'marquise', ct: 1.5, ratio: 2, center: 'teal', head: 'bezel', accent: 'none', band: 'knife', bandW: 1.8 } },
];
// Prices by metal, from the builder's price model (tools/render.js returns these; paste them back here after a re-render).
window.PRICES = {"wren":{"plat":4750,"y18":4650,"r14":4450},"ines":{"plat":5400,"y18":5300,"r14":5050},"celeste":{"plat":6500,"y18":6350,"r14":6050},"margot":{"plat":6250,"y18":6100,"r14":5750},"oriel":{"plat":5750,"y18":5600,"r14":5300},"sloane":{"plat":6750,"y18":6650,"r14":6400},"vesper":{"plat":5050,"y18":4850,"r14":4500},"asha":{"plat":6150,"y18":6050,"r14":5850},"juno":{"plat":7800,"y18":7650,"r14":7300},"regent":{"plat":9400,"y18":9250,"r14":8900},"aurora":{"plat":8500,"y18":8350,"r14":8050},"tide":{"plat":6650,"y18":6500,"r14":6200}};
