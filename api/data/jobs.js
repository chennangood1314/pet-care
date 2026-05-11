// 招聘岗位初始数据
export const JOBS = [
  {
    id: 1,
    clinicName: '瑞鹏宠物医院（朝阳分院）',
    title: '宠物医生',
    salary: '15K-25K',
    location: '北京朝阳区',
    experience: '3-5年',
    education: '本科及以上',
    description: '负责门诊日常诊疗、手术、住院宠物管理等工作',
    requirements: '1. 持有国家执业兽医师资格证\n2. 3年以上临床经验\n3. 能独立完成常见外科手术\n4. 良好的沟通能力和服务意识',
    benefits: '五险一金、带薪年假、定期培训、员工宠物免费医疗',
    contactPhone: '010-88886666',
    contactPerson: '张院长',
    type: 'fulltime',
    status: 'approved',
    createdAt: '2026-04-15T08:00:00.000Z',
    applicantCount: 12
  },
  {
    id: 2,
    clinicName: '宠爱国际动物医院',
    title: '兽医助理',
    salary: '6K-9K',
    location: '上海浦东新区',
    experience: '1-3年',
    education: '大专及以上',
    description: '协助医生完成诊疗、护理住院宠物、管理医疗器械',
    requirements: '1. 动物医学相关专业\n2. 热爱小动物、有耐心\n3. 能接受周末轮班',
    benefits: '五险一金、员工宿舍、餐补、节日福利',
    contactPhone: '021-66668888',
    contactPerson: '李主任',
    type: 'fulltime',
    status: 'approved',
    createdAt: '2026-04-20T10:00:00.000Z',
    applicantCount: 28
  },
  {
    id: 3,
    clinicName: '芭比堂动物医院（海淀总院）',
    title: '宠物美容师',
    salary: '8K-12K',
    location: '北京海淀区',
    experience: '2年以上',
    education: '不限',
    description: '为犬猫提供洗澡、剪毛、造型等美容服务',
    requirements: '1. 持有宠物美容师证书（B级以上）\n2. 2年以上宠物美容经验\n3. 熟悉不同犬种的造型标准',
    benefits: '底薪+提成、五险、免费培训、团建活动',
    contactPhone: '010-66669999',
    contactPerson: '王经理',
    type: 'fulltime',
    status: 'approved',
    createdAt: '2026-04-25T14:00:00.000Z',
    applicantCount: 35
  },
  {
    id: 4,
    clinicName: '美联众合动物医院',
    title: '宠物医生助理（实习生）',
    salary: '3K-5K',
    location: '广州天河区',
    experience: '应届毕业生',
    education: '大专及以上',
    description: '在资深兽医师指导下，学习临床诊疗技能',
    requirements: '1. 动物医学相关专业应届毕业生\n2. 踏实肯学、吃苦耐劳\n3. 有实习经验优先',
    benefits: '提供住宿、餐补、转正机会、导师带教',
    contactPhone: '020-88887777',
    contactPerson: '陈主任',
    type: 'intern',
    status: 'approved',
    createdAt: '2026-05-01T09:00:00.000Z',
    applicantCount: 52
  },
  {
    id: 5,
    clinicName: '爱诺动物医院',
    title: '宠物医院前台客服',
    salary: '5K-7K',
    location: '深圳南山区',
    experience: '1年以上',
    education: '高中及以上',
    description: '负责前台接待、预约挂号、收费结算、客户咨询',
    requirements: '1. 形象气质佳、亲和力强\n2. 熟练使用办公软件\n3. 有宠物行业或医疗服务经验优先',
    benefits: '五险、双休、年假、宠物医疗优惠',
    contactPhone: '0755-66667777',
    contactPerson: '赵院长',
    type: 'fulltime',
    status: 'pending',
    createdAt: '2026-05-08T11:00:00.000Z',
    applicantCount: 0
  },
  {
    id: 6,
    clinicName: '瑞派宠物医院',
    title: '兼职宠物医生（周末）',
    salary: '500-800元/天',
    location: '成都武侯区',
    experience: '5年以上',
    education: '本科及以上',
    description: '负责周末门诊和住院巡诊',
    requirements: '1. 持有执业兽医师资格证\n2. 5年以上犬猫临床经验\n3. 能独立处理常见急诊',
    benefits: '日结工资、弹性工作',
    contactPhone: '028-88889999',
    contactPerson: '刘主任',
    type: 'parttime',
    status: 'pending',
    createdAt: '2026-05-09T15:00:00.000Z',
    applicantCount: 0
  }
];

export const JOB_TYPES = [
  { value: 'fulltime', label: '全职' },
  { value: 'parttime', label: '兼职' },
  { value: 'intern', label: '实习' }
];

export const JOB_STATUS = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'closed', label: '已关闭' }
];
