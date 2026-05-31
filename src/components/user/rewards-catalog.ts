export type RewardCatalogItem = {
  id: string;
  title: string;
  category: "Voucher" | "Quà tặng" | "Đóng góp" | "Dịch vụ";
  points: number;
  stock: number;
  image: string;
  description: string;
  impact: string;
  badge?: string;
};

export const rewardCatalog: RewardCatalogItem[] = [
  {
    id: "highlands-50k",
    title: "Voucher Highlands Coffee 50k",
    category: "Voucher",
    points: 450,
    stock: 38,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXH3Y0t7aHLj_gNDuh4gPp78auQVD-Z7bNOOzLwjGU4XJE7VQGAg-I8tbnzUTtEzErQS1lqujRDIq0_KztgUIaCr7y5lkInp4yVcbGgZ644N6gMeL4W4ji8hVVmUwGwX5NP7rfHwU4uiiGKAFVx_VoHT07_bqYieNERohTk1FOUwwj6DaLHjQVN9o23F8eWw3Jzj_JSMCDaU1-ErieT9D1tMDJVQYBEm9qUBrg2k749tgtx84AjjFYBEx_6Y51aDeAhtRUkLFf1McG",
    description: "Voucher đồ uống áp dụng tại cửa hàng đối tác trong chương trình Eco-Reward.",
    impact: "Khuyến khích thói quen phân loại rác mỗi ngày.",
    badge: "Voucher",
  },
  {
    id: "eco-tote",
    title: "Túi vải Eco-friendly",
    category: "Quà tặng",
    points: 200,
    stock: 45,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWhNMapFTB5M21pvHve0XpVFPXQdAnO0eH6uXT-qSoLWV43_oIzlyWLIPpHuY0cfUnEupUHKXwK1ytLJrxx-f5Z2ES09p8A31OVIZLbHJWRqvYkHSJVSpE3nTMh_Mh08NRJIpyODwUtjmEsrp5-WDxBqOMybP3AFFWxeiuFAtf7vcFZFU56sJZwhKUAQp5xmYlkboS6WIitZXqZAhbVMJDUmG0PNcjrj6oQVEQjIn0EtotGvscbyfSXAiDrpbhXfegNiomniE3bj-y",
    description: "Túi vải canvas sản xuất từ sợi bông hữu cơ, bền nhẹ và thay thế túi nilon dùng một lần.",
    impact: "Giảm khoảng 2kg CO2 và rác thải nhựa trong quá trình sử dụng.",
    badge: "Quà tặng",
  },
  {
    id: "plant-tree",
    title: "Gói trồng 1 cây xanh",
    category: "Đóng góp",
    points: 1000,
    stock: 120,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCSVBCZsZQj_jdqU0V0OLNQ3iQZQ4Zsz1ELPBh5D_QmLd3vuIAqVrw4qRpoQyV-MtP1lJEEkOo8GkN8pTJSzrHiOHonrPGrQi5R99NVPyDraplucbJBSOichtgbyZ_ZXjtO8ESpmjm151r7qqhJZDWczjoATIVDZWvysXxf7LzMhaUi2ewZ4u-wSP74H6WOHYIxp9UtnCM2pldKJuS6XADiydJB0-fO8Y1qiWAADep4sUiJ6Rvjd2DJJN0vS_GDufjJG90ufzaynacr",
    description: "Đóng góp điểm để trồng cây tại khu vực xanh được hệ thống ghi nhận theo chiến dịch.",
    impact: "Tăng diện tích xanh và bù đắp phát thải dài hạn.",
    badge: "Đóng góp",
  },
  {
    id: "circle-k-20k",
    title: "Voucher Circle K 20k",
    category: "Voucher",
    points: 200,
    stock: 64,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6vmcYSZI-OzVx_TP3wvnnr2pRKy2xWlZCbkXhxWhKiT_r-f8_K774I5M1BgfLpRV8Qdp-3tPSpO2Bwb2GIm8zlc9lApjQwCtQhrA6Ejict3DtEfVNl5455k0ZoeS8EgKNwlTEx3aUCUbJE_mS5hJtuI93TpXCsntGC1Z3bM5ZYe3nAfQHoPQZQ4T363jgvejmsO_WU4NDzo8TrZupTIfW0t-hq9L8KMALY6c-ybY6kfqVkc6VDWEScBAqMgbImTDnFjTkIcVN8TLv",
    description: "Voucher tiện ích dùng tại chuỗi cửa hàng đối tác trong hệ sinh thái Eco-Reward.",
    impact: "Đổi ưu đãi nhỏ từ thói quen xanh hằng ngày.",
    badge: "Voucher",
  },
  {
    id: "marine-donation",
    title: "Quyên góp cứu trợ sinh vật biển",
    category: "Đóng góp",
    points: 200,
    stock: 999,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBh6RdKbk_o9pV5X7IcZW3cV1FtRbgxfWUSR6OaSp8_HEge1DMcoKQV5lkFNBW7DIQZ4mGtVsihy-la0hCAihq54_pRklMe7DQGGPAY1TkQve0g6PxcTrbF8E2G36yHYpjT5Th9HPnNov9ydRCTI3-9RJBq5IhVhiqVkR1xESBP-5bgkkipVdaJGey02bQuUvUMSEekIRVQp-OvxqN459X3Pecnn2wVMq4j0jRR0fBsMINz0FX5SZH3fKaUgbid_hbelJ8C_Q1p4J8Z",
    description: "Góp điểm vào quỹ bảo vệ sinh vật biển và giảm tác động từ rác nhựa đại dương.",
    impact: "Hỗ trợ chiến dịch biển sạch.",
    badge: "Đóng góp",
  },
  {
    id: "winmart-100k",
    title: "Winmart Gift Card 100k",
    category: "Voucher",
    points: 950,
    stock: 22,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQTwAqna-gwOEEj9_ODR2G3Zwz69ZUYcxatlJXyDfJLFOvcCjeRs65v0wtuJzMVZXbnNfMPteX0VpbtB89Rw7E5dq31Jb7u1I3vgl4Z-KySfzr8RCMKcRZMMRawC3H2XLCNSpJKGwHw-XaohPUUnjwHwhnmVB-5G80TymIQHEKDFT7jIWKT3SbmHnL-3Ixd_IgsfVjhO-mfYRKNQa8Vmpc6O6kuWWLYXtgMxvm1hHHl-MXgagMGwYUfvTGZuhhi1jv49wY4xDt_XFQ",
    description: "Gift card mua sắm xanh cho nhu yếu phẩm và sản phẩm thân thiện môi trường.",
    impact: "Ưu tiên tiêu dùng bền vững.",
    badge: "Voucher",
  },
];
