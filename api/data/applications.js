// 求职申请初始数据（示例数据）
export const APPLICATIONS = [
  {
    id: 1,
    jobId: 1,
    jobTitle: '宠物医生',
    clinicName: '瑞鹏宠物医院（朝阳分院）',
    applicantName: '周小明',
    applicantPhone: '13900139001',
    applicantEmail: 'zhouxm@example.com',
    experience: '4年宠物临床经验',
    resume: '本人在瑞鹏体系工作4年，熟悉常见犬猫疾病诊疗流程，已完成500+台外科手术。',
    status: 'pending',
    createdAt: '2026-05-05T08:30:00.000Z'
  },
  {
    id: 2,
    jobId: 2,
    jobTitle: '兽医助理',
    clinicName: '宠爱国际动物医院',
    applicantName: '林小红',
    applicantPhone: '13900139002',
    applicantEmail: '',
    experience: '应届毕业生',
    resume: '动物医学专业2026届毕业生，在校期间在宠物医院实习过3个月，热爱小动物。',
    status: 'viewed',
    createdAt: '2026-05-06T14:20:00.000Z'
  }
];

export const APPLICATION_STATUS = [
  { value: 'pending', label: '待查看' },
  { value: 'viewed', label: '已查看' },
  { value: 'contacted', label: '已联系' },
  { value: 'hired', label: '已录用' },
  { value: 'rejected', label: '已拒绝' }
];
