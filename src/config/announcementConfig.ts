import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "更新",

	// 公告内容
	content: "AI 小说工厂产出的 Markdown 作品会在这里持续归档。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "查看小说",
		// 链接 URL
		url: "/archive/?category=%E5%B0%8F%E8%AF%B4",
		// 内部链接
		external: false,
	},
};
