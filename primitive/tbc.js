const _deepRichColors = `
  "#2B2D42", // Charcoal Blue
  "#3F3351", // Deep Purple
  "#450920", // Burgundy Velvet
  "#423629", // Dark Walnut
  "#004346", // Teal Deep
  "#283618", // Hunter Green
  "#462255", // Royal Purple
  "#540B0E", // Dark Burgundy
  "#1B263B", // Midnight Blue
  "#0B132B", // Blue Black
  "#353535", // Onyx
  "#3C1874", // Persian Indigo
  "#08415C", // Deep Sea Blue
  "#650D1B", // Claret Red
  "#005F73", // Deep Cyan
  "#101820", // Rich Black
  "#1A1423", // Eclipse
  "#6622CC", // Deep Violet
  "#4A4E69", // Independence Blue
  "#6A040F", // Red Oxide
  "#264653", // Charleston Green
  "#230C33", // Blackcurrant
  "#3A0CA3", // Vivid Blue Violet
  "#240046", // Russian Violet
  "#10002B", // Deep Purple
`;
const _childrenRoomColors = `
  "#FF9AA2", // Soft Coral
  "#FFB7B2", // Light Salmon Pink
  "#FFDAC1", // Peach Crayola
  "#E2F0CB", // Tea Green
  "#B5EAD7", // Magic Mint
  "#C7CEEA", // Periwinkle Crayola
  "#FFD700", // Bright Gold
  "#FDDB3A", // Banana Mania
  "#87CEFA", // Light Sky Blue
  "#77DD77", // Pastel Green
  "#F49AC2", // Pastel Pink
  "#836FFF", // Light Slate Blue
  "#CB99C9", // Pastel Violet
  "#FF6961", // Pastel Red
  "#03C03C", // Dark Pastel Green
  "#FDFD96", // Pastel Yellow
  "#AEC6CF", // Pastel Blue
  "#DEA5A4", // Pastel Red
  "#FFB347", // Pastel Orange
  "#77B5FE", // French Sky Blue
  "#FDBCB4", // Melon
  "#779ECB", // Slate Blue
  "#966FD6", // Dark Pastel Purple
  "#FFD1DC", // Piggy Pink
  "#FFD700", // Golden Poppy
  "#B39EB5", // Lilac
  "#FF6961", // Salmon Pink
  "#C23B22", // Dark Pastel Red
  "#CFCFC4", // Pastel Gray
  "#A23BEC", // Bright Purple
`;
const _vibrantColors = `
  "#FF4057", // Bright Red
  "#00B8A9", // Vivid Teal
  "#F46036", // Vibrant Orange
  "#E71D36", // Strong Carmine
  "#2EC4B6", // Bright Turquoise
  "#FFD166", // Sunny Yellow
  "#06D6A0", // Neon Green
  "#EF476F", // Fuchsia Pink
  "#26547C", // Cobalt Blue
  "#FF9F1C", // Electric Orange
  "#00BBF9", // Bright Sky Blue
  "#118AB2", // Blue NCS
  "#073B4C", // Dark Cyan
  "#FFD32D", // Bright Yellow
  "#8338EC", // Electric Purple
  "#FB5607", // Tango Orange
  "#FF006E", // Neon Pink
  "#3A86FF", // Vivid Blue
  "#FFBE0B", // Bitter Lemon
  "#FF006E", // Magenta
  "#48BF84", // Mint Green
  "#F94144", // Vermilion Red
  "#F3722C", // Orange (Red C)
  "#90BE6D", // Pistachio Green
  "#577590", // Blue Yonder
  "#9B5DE5", // Lavender Purple
  "#F15BB5", // Light Magenta
  "#FEE440", // Electric Yellow
  "#00F5D4", // Bright Cyan
  "#7209B7", // Byzantine Purple
`;
const _modernColors = `
  "#FF6F61", // Vibrant Coral
  "#6B5B95", // Subdued Purple
  "#88B04B", // Leafy Green
  "#F7CAC9", // Pastel Pink
  "#92A8D1", // Soft Blue
  "#955251", // Warm Terra Cotta
  "#B565A7", // Muted Lilac
  "#009B77", // Deep Aqua
  "#DD4124", // Fiery Red
  "#D65076", // Bright Pink
  "#45B8AC", // Ocean Blue
  "#EFC050", // Sunny Yellow
  "#5B5EA6", // Majestic Purple
  "#9B2335", // Strong Red
  "#DFCFBE", // Neutral Beige
  "#55B4B0", // Soft Turquoise
  "#E15D44", // Burnt Orange
  "#7FCDCD", // Pale Cyan
  "#BC243C", // Powerful Red
  "#C3447A", // Deep Pink
  "#98B4D4", // Light Blue
  "#8D9440", // Olive Green
  "#FFD662", // Bright Yellow
  "#A4B086", // Sage Green
  "#774D8E", // Dark Purple
  "#F4B9B8", // Light Coral
  "#6E81A0", // Smoky Blue
  "#5A7247", // Hunter Green
  "#FF968A", // Soft Red
  "#D2C29D", // Earthy Gold
  "#F2E2E0", // Off White
  "#83781B", // Brass Yellow
  "#E1EDE9", // Pale Mint
  "#5E3D26", // Deep Brown
`;

//orig
const deepRichColors = [
  "#2B2D42", // Charcoal Blue
  "#3F3351", // Deep Purple
  "#450920", // Burgundy Velvet
  "#423629", // Dark Walnut
  "#004346", // Teal Deep
  "#283618", // Hunter Green
  "#462255", // Royal Purple
  "#540B0E", // Dark Burgundy
  "#1B263B", // Midnight Blue
  "#0B132B", // Blue Black
  "#353535", // Onyx
  "#3C1874", // Persian Indigo
  "#08415C", // Deep Sea Blue
  "#650D1B", // Claret Red
  "#005F73", // Deep Cyan
  "#101820", // Rich Black
  "#1A1423", // Eclipse
  "#6622CC", // Deep Violet
  "#4A4E69", // Independence Blue
  "#6A040F", // Red Oxide
  "#264653", // Charleston Green
  "#230C33", // Blackcurrant
  "#3A0CA3", // Vivid Blue Violet
  "#240046", // Russian Violet
  "#10002B", // Deep Purple
];
const childrenRoomColors = [
  "#FF9AA2", // Soft Coral
  "#FFB7B2", // Light Salmon Pink
  "#FFDAC1", // Peach Crayola
  "#E2F0CB", // Tea Green
  "#B5EAD7", // Magic Mint
  "#C7CEEA", // Periwinkle Crayola
  "#FFD700", // Bright Gold
  "#FDDB3A", // Banana Mania
  "#87CEFA", // Light Sky Blue
  "#77DD77", // Pastel Green
  "#F49AC2", // Pastel Pink
  "#836FFF", // Light Slate Blue
  "#CB99C9", // Pastel Violet
  "#FF6961", // Pastel Red
  "#03C03C", // Dark Pastel Green
  "#FDFD96", // Pastel Yellow
  "#AEC6CF", // Pastel Blue
  "#DEA5A4", // Pastel Red
  "#FFB347", // Pastel Orange
  "#77B5FE", // French Sky Blue
  "#FDBCB4", // Melon
  "#779ECB", // Slate Blue
  "#966FD6", // Dark Pastel Purple
  "#FFD1DC", // Piggy Pink
  "#FFD700", // Golden Poppy
  "#B39EB5", // Lilac
  "#FF6961", // Salmon Pink
  "#C23B22", // Dark Pastel Red
  "#CFCFC4", // Pastel Gray
  "#A23BEC", // Bright Purple
];
const vibrantColors = [
  "#FF4057", // Bright Red
  "#00B8A9", // Vivid Teal
  "#F46036", // Vibrant Orange
  "#E71D36", // Strong Carmine
  "#2EC4B6", // Bright Turquoise
  "#FFD166", // Sunny Yellow
  "#06D6A0", // Neon Green
  "#EF476F", // Fuchsia Pink
  "#26547C", // Cobalt Blue
  "#FF9F1C", // Electric Orange
  "#00BBF9", // Bright Sky Blue
  "#118AB2", // Blue NCS
  "#073B4C", // Dark Cyan
  "#FFD32D", // Bright Yellow
  "#8338EC", // Electric Purple
  "#FB5607", // Tango Orange
  "#FF006E", // Neon Pink
  "#3A86FF", // Vivid Blue
  "#FFBE0B", // Bitter Lemon
  "#FF006E", // Magenta
  "#48BF84", // Mint Green
  "#F94144", // Vermilion Red
  "#F3722C", // Orange (Red C)
  "#90BE6D", // Pistachio Green
  "#577590", // Blue Yonder
  "#9B5DE5", // Lavender Purple
  "#F15BB5", // Light Magenta
  "#FEE440", // Electric Yellow
  "#00F5D4", // Bright Cyan
  "#7209B7", // Byzantine Purple
];
const modernColors = [
  "#FF6F61", // Vibrant Coral
  "#6B5B95", // Subdued Purple
  "#88B04B", // Leafy Green
  "#F7CAC9", // Pastel Pink
  "#92A8D1", // Soft Blue
  "#955251", // Warm Terra Cotta
  "#B565A7", // Muted Lilac
  "#009B77", // Deep Aqua
  "#DD4124", // Fiery Red
  "#D65076", // Bright Pink
  "#45B8AC", // Ocean Blue
  "#EFC050", // Sunny Yellow
  "#5B5EA6", // Majestic Purple
  "#9B2335", // Strong Red
  "#DFCFBE", // Neutral Beige
  "#55B4B0", // Soft Turquoise
  "#E15D44", // Burnt Orange
  "#7FCDCD", // Pale Cyan
  "#BC243C", // Powerful Red
  "#C3447A", // Deep Pink
  "#98B4D4", // Light Blue
  "#8D9440", // Olive Green
  "#FFD662", // Bright Yellow
  "#A4B086", // Sage Green
  "#774D8E", // Dark Purple
  "#F4B9B8", // Light Coral
  "#6E81A0", // Smoky Blue
  "#5A7247", // Hunter Green
  "#FF968A", // Soft Red
  "#D2C29D", // Earthy Gold
  "#F2E2E0", // Off White
  "#83781B", // Brass Yellow
  "#E1EDE9", // Pale Mint
  "#5E3D26", // Deep Brown
];

