import type { SidebarLayoutConfig } from "../types/sidebarConfig";

export const sidebarLayoutConfig: SidebarLayoutConfig = {
	enable: true,
	position: "both",
	tabletSidebar: "left",
	showBothSidebarsOnPostPage: true,

	leftComponents: [
		{
			type: "profile",
			enable: true,
			position: "top",
			showOnPostPage: true,
		},
		{
			type: "announcement",
			enable: true,
			position: "top",
			showOnPostPage: true,
		},
		{
			type: "categories",
			enable: true,
			position: "sticky",
			showOnPostPage: true,
			specificConfig: {
				collapseThreshold: 8,
			},
		},
		{
			type: "tags",
			enable: true,
			position: "sticky",
			showOnPostPage: true,
			specificConfig: {
				collapseThreshold: 16,
			},
		},
	],

	rightComponents: [
		{
			type: "stats",
			enable: true,
			position: "top",
			showOnPostPage: true,
		},
		{
			type: "sidebarToc",
			enable: true,
			position: "sticky",
			showOnPostPage: true,
			showOnNonPostPage: false,
		},
	],

	mobileBottomComponents: [
		{
			type: "profile",
			enable: true,
			showOnPostPage: true,
		},
		{
			type: "announcement",
			enable: true,
			showOnPostPage: true,
		},
		{
			type: "categories",
			enable: true,
			showOnPostPage: true,
			specificConfig: {
				collapseThreshold: 8,
			},
		},
		{
			type: "tags",
			enable: true,
			showOnPostPage: true,
			specificConfig: {
				collapseThreshold: 16,
			},
		},
		{
			type: "stats",
			enable: true,
			showOnPostPage: true,
		},
	],
};
