// 专家初始数据（预置已审核通过的专家示例）
export const EXPERTS = [
  {
    id: 1,
    name: '张明华',
    phone: '13800138001',
    specialty: '犬科内科',
    qualifications: '中国农业大学兽医学博士，10年临床经验，持有国家执业兽医师资格证',
    hospital: '瑞鹏宠物医院（朝阳分院）',
    avatar: '👨‍⚕️',
    introduction: '擅长犬类消化系统疾病、呼吸道疾病及老年犬慢性病管理，累计接诊犬类病例超过5000例。',
    status: 'approved',
    createdAt: '2026-03-01T08:00:00.000Z'
  },
  {
    id: 2,
    name: '李晓芳',
    phone: '13800138002',
    specialty: '猫科',
    qualifications: '南京农业大学兽医硕士，8年猫科临床经验，国际猫科医学协会（ISFM）认证会员',
    hospital: '宠爱国际动物医院',
    avatar: '👩‍⚕️',
    introduction: '专注猫科疾病诊疗，尤其擅长猫下泌尿道疾病、猫传染性腹膜炎（FIP）及猫慢性肾病管理。',
    status: 'approved',
    createdAt: '2026-03-05T10:30:00.000Z'
  },
  {
    id: 3,
    name: '王建国',
    phone: '13800138003',
    specialty: '宠物皮肤科',
    qualifications: '吉林大学兽医学学士，12年临床经验，亚洲兽医皮肤科协会会员',
    hospital: '芭比堂动物医院（海淀总院）',
    avatar: '👨‍🔬',
    introduction: '专攻犬猫皮肤病，包括过敏性皮炎、真菌/细菌感染、寄生虫性皮肤病及免疫介导性皮肤病。',
    status: 'approved',
    createdAt: '2026-03-10T14:00:00.000Z'
  },
  {
    id: 4,
    name: '陈雨婷',
    phone: '13800138004',
    specialty: '宠物骨科',
    qualifications: '华中农业大学兽医博士，9年骨科临床经验，完成AO高级骨科课程认证',
    hospital: '美联众合动物医院',
    avatar: '👩‍🔬',
    introduction: '擅长宠物骨折内固定、髌骨脱位矫正、髋关节发育不良手术及术后康复管理。',
    status: 'pending',
    createdAt: '2026-05-08T09:00:00.000Z'
  },
  {
    id: 5,
    name: '赵伟强',
    phone: '13800138005',
    specialty: '异宠科',
    qualifications: '浙江大学兽医学硕士，7年异宠临床经验',
    hospital: '爱诺动物医院',
    avatar: '👨‍⚕️',
    introduction: '专门诊治兔、仓鼠、龙猫、鸟类、爬行类等非犬猫宠物疾病。',
    status: 'pending',
    createdAt: '2026-05-09T16:00:00.000Z'
  }
];

// 主治方向选项
export const SPECIALTIES = [
  { value: '犬科内科', label: '犬科内科' },
  { value: '猫科', label: '猫科' },
  { value: '宠物皮肤科', label: '宠物皮肤科' },
  { value: '宠物骨科', label: '宠物骨科' },
  { value: '宠物眼科', label: '宠物眼科' },
  { value: '宠物牙科', label: '宠物牙科' },
  { value: '宠物心脏科', label: '宠物心脏科' },
  { value: '宠物肿瘤科', label: '宠物肿瘤科' },
  { value: '宠物神经科', label: '宠物神经科' },
  { value: '异宠科', label: '异宠科' },
  { value: '宠物营养科', label: '宠物营养科' },
  { value: '宠物行为科', label: '宠物行为科' },
  { value: '宠物中医科', label: '宠物中医科' },
  { value: '宠物急诊科', label: '宠物急诊科' }
];

export const EXPERT_STATUS = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' }
];
