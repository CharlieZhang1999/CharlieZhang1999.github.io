/* ==========================================================================
   SITE CONTENT
   --------------------------------------------------------------------------
   This is the only file you need to edit to update the site.
   - Images go in /assets/img/... (any size; ~1600px on the long edge is ideal)
   - Posts are Markdown files in /content/posts/<slug>.md
   - Anything marked PLACEHOLDER is sample content waiting for the real thing.
   ========================================================================== */

window.SITE = {
  name: "Charlie Zhang",
  legalName: "Qiuyang Zhang",
  tagline: "Software engineer who cares how things feel.",
  // Short line under the name in the hero.
  intro:
    "I build applications that are kind to the people using them, and keep a small archive of the films, songs, places and sentences that made me who I am.",
  portrait: "assets/img/portrait.jpg",
  portraitCaption: "Beijing, Dec 2020",

  // Big statement in the About section. Words fade in as you scroll.
  statement:
    "I like software that disappears into the experience: interfaces that feel obvious, systems that quietly hold up, and AI that makes people a little less alone. Outside of code I collect light, melodies and parallel universes.",

  facts: [
    { label: "Studied", value: "M.S. Software Engineering, Carnegie Mellon University" },
    { label: "Before that", value: "B.S. Computer Science, UNC Chapel Hill" },
    { label: "Interested in", value: "Human-centred apps, AI for mental health, computer vision" },
    { label: "Fun facts", value: "喜欢aespa金冬天的蓝吒玩家 · 能瞎比划连蒙带猜的自学韩语选手" },
  ],

  links: {
    email: "", // PLACEHOLDER: add your email, e.g. "hello@example.com"
    github: "https://github.com/CharlieZhang1999",
    linkedin: "https://www.linkedin.com/in/qiuyang-zhang-489743196",
    resume: "assets/files/resume.pdf",
    // Optional: instagram, youtube, bilibili, xiaohongshu, spotify ...
    instagram: "",
    bilibili: "",
  },

  /* ---------------------------------------------------------------- WORK */
  projects: [
    {
      title: "Incident Response",
      year: "2023",
      role: "Full-stack · UX",
      tags: ["React", "Socket.IO", "MongoDB", "Figma"],
      cover: "assets/img/work/01.jpg",
      summary:
        "An emergency app for citizens and first responders: live group chat and incident management in one calm, legible interface.",
      points: [
        "Built the real-time incident and chat flows with React, Socket.IO and MongoDB.",
        "Designed in Figma with Ant Design and Storybook; ran heuristic evaluations against Nielsen's 10 principles.",
        "Test-driven development with 80%+ coverage; shipped 50 story points across three Scrum sprints.",
      ],
      link: "",
    },
    {
      title: "Smart Crop on iOS",
      year: "2023",
      role: "Amazon · SDE Intern",
      tags: ["Swift", "Vision", "Neural Engine"],
      cover: "assets/img/work/02.jpg",
      summary:
        "On-device saliency-based smart cropping with Apple's Vision framework, benchmarked against Amazon's in-house model.",
      points: [
        "Generated saliency bounding boxes with the iOS Edge Saliency model on the Neural Engine.",
        "Evaluated on 1.5k+ images (selfies, food, landscapes) for latency and IoU.",
        "Built a side-by-side Xcode prototype and shipped a TestFlight beta.",
      ],
      link: "",
    },
    {
      title: "Emergency Social Network",
      year: "2022",
      role: "Full-stack",
      tags: ["TypeScript", "Node.js", "CI/CD"],
      cover: "assets/img/work/03.jpg",
      summary:
        "A COVID-19 social network for real-time communication, with private and public chat, search, and a daily safety quiz.",
      points: [
        "Built private chat, public chat and keyword search.",
        "Created the COVID-19 Daily Quiz to raise awareness of protective measures.",
        "User stories, OO analysis, prototyping, testing and CI/CD in a Scrum + Kanban hybrid.",
      ],
      link: "",
    },
    {
      title: "Video Body Segmentation",
      year: "2021",
      role: "UNC Graphics & VR Group",
      tags: ["PyTorch", "ResNet", "Optical flow"],
      cover: "assets/img/work/04.jpg",
      summary:
        "Human-body segmentation as a prior for 3D body reconstruction, advised by Prof. Henry Fuchs.",
      points: [
        "Trained a ResNet segmentation model on human body images.",
        "Used temporal information with a propagation module and optical flow to lift video IoU.",
      ],
      link: "",
    },
  ],

  experience: [
    { when: "2023", role: "Software Development Engineer Intern", org: "Amazon" },
    { when: "2021 – 22", role: "Research Assistant", org: "UNC Graphics & Virtual Reality Group" },
    { when: "2021", role: "Backend Intern", org: "Gridsum Technology, Shenzhen" },
    { when: "2020", role: "Research Assistant", org: "UNC BRIC IDEA Lab" },
    { when: "2020", role: "Instructional Assistant", org: "UNC Statistics & Operations Research" },
  ],

  /* -------------------------------------------------------------- MEMORY */
  // PLACEHOLDER photos: replace src with your own (assets/img/photos/...).
  photos: [
    { src: "assets/img/photos/01.jpg", caption: "Last light on the street", place: "Somewhere warm", date: "2024" },
    { src: "assets/img/photos/02.jpg", caption: "Blue hour by the water", place: "A harbour", date: "2024" },
    { src: "assets/img/photos/03.jpg", caption: "A window, late afternoon", place: "Home", date: "2023" },
    { src: "assets/img/photos/04.jpg", caption: "City lights after rain", place: "Downtown", date: "2023" },
    { src: "assets/img/photos/05.jpg", caption: "Soft focus", place: "Spring", date: "2023" },
    { src: "assets/img/photos/06.jpg", caption: "Green, everywhere", place: "A hike", date: "2022" },
    { src: "assets/img/photos/07.jpg", caption: "Concert night", place: "Front row", date: "2022" },
    { src: "assets/img/photos/08.jpg", caption: "Morning, overexposed", place: "Hotel room", date: "2021" },
  ],

  // PLACEHOLDER vlogs. url = a YouTube or Bilibili link. Leave "" to show "coming soon".
  vlogs: [
    { title: "A week in the life", note: "Episode 01", length: "08:24", thumb: "assets/img/vlogs/01.jpg", url: "" },
    { title: "Rainy-day city walk", note: "Episode 02", length: "05:10", thumb: "assets/img/vlogs/02.jpg", url: "" },
    { title: "Learning Korean, badly", note: "Episode 03", length: "06:47", thumb: "assets/img/vlogs/03.jpg", url: "" },
  ],

  // PLACEHOLDER music. link = Spotify / Apple Music / NetEase link. audio = optional mp3 in assets/audio.
  music: [
    { title: "Supernova", artist: "aespa", note: "Winter's verse, every time.", cover: "assets/img/music/01.jpg", link: "", audio: "" },
    { title: "大鱼", artist: "周深", note: "The voice I'd want in my ideal world.", cover: "assets/img/music/02.jpg", link: "", audio: "" },
    { title: "Drama", artist: "aespa", note: "For walking faster than you need to.", cover: "assets/img/music/03.jpg", link: "", audio: "" },
    { title: "光亮", artist: "周深", note: "Late-night coding, windows open.", cover: "assets/img/music/04.jpg", link: "", audio: "" },
    { title: "Next Level", artist: "aespa", note: "The one that started it.", cover: "assets/img/music/05.jpg", link: "", audio: "" },
    { title: "Your song here", artist: "—", note: "Placeholder, add your own.", cover: "assets/img/music/06.jpg", link: "", audio: "" },
  ],

  // Posts. Body lives in content/posts/<slug>.md
  posts: [
    {
      slug: "brush-up-life",
      title: "ブラッシュアップライフ",
      date: "2023-09-07",
      category: "Movies",
      excerpt:
        "一直很喜欢日本人细腻的笔法和镜头下琐碎日常的流动，所以费尽心思找到了《重启人生》。真的是一部很理想主义的日剧。",
    },
    {
      slug: "chatgpt-mother",
      title: "ChatGPT：我要给她完整的一生",
      date: "2023-02-21",
      category: "Thinking",
      excerpt:
        "晚上突然百感交集写下这篇的原因，是看到了B站上一个up主做的关于ChatGPT的一个视频：《和ChatGPT说“我7岁那年，妈妈去世了。你能当我的妈妈吗？”》",
    },
    {
      slug: "everything-everywhere",
      title: "看完《瞬息全宇宙》的一些胡思乱想",
      date: "2022-06-07",
      category: "Movies",
      excerpt:
        "正是不同时间的不同选择才造就了人这种非线性生物。没有必要因为一时的卡关，一个选择所陷入的低谷，就放弃了之后成千上万个选择的机会。",
    },
  ],

  // "My ideal world": short lines, shown as a slow manifesto. PLACEHOLDER lines drawn from your posts.
  idealWorld: [
    "Tennis on a Sunday morning.",
    "1Q84 on a long train ride.",
    "Friendships that get a second, third, fourth life.",
    "Software that makes people feel less alone.",
    "A parallel universe where I'm fluent in Korean.",
    "Every bagel is just a bagel.",
  ],
};
