import {
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/navBarConfig";

const getDynamicNavBarConfig = (): NavBarConfig => {
	const links: NavBarLink[] = [
		LinkPresets.Home,
		{
			name: "小说",
			url: "#",
			icon: "material-symbols:menu-book-outline-rounded",
			children: [
				LinkPresets.Archive,
				LinkPresets.Categories,
				LinkPresets.Tags,
			],
		},
		LinkPresets.About,
		LinkPresets.RSS,
		{
			name: "GitHub",
			url: "https://github.com/lzcjyx/Firefly",
			external: true,
			icon: "fa7-brands:github",
		},
	];

	return { links } as NavBarConfig;
};

export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const LinkPresets: Record<string, NavBarLink> = {
	Home: {
		name: "主页",
		url: "/",
		icon: "material-symbols:home",
	},
	Archive: {
		name: "归档",
		url: "/archive/",
		icon: "material-symbols:archive",
	},
	Categories: {
		name: "分类",
		url: "/categories/",
		icon: "material-symbols:folder-open-rounded",
	},
	Tags: {
		name: "标签",
		url: "/tags/",
		icon: "material-symbols:tag-rounded",
	},
	About: {
		name: "关于",
		url: "/about/",
		icon: "material-symbols:person",
	},
	RSS: {
		name: "RSS",
		url: "/rss/",
		icon: "fa7-solid:rss",
	},
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
