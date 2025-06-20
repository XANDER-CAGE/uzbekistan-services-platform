import { DataSource } from 'typeorm';
import { ServiceCategory } from '../../modules/categories/entities/service-category.entity';

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const categoryRepository = dataSource.getRepository(ServiceCategory);
  
  // Проверяем, есть ли уже категории
  const existingCategories = await categoryRepository.count();
  if (existingCategories > 0) {
    console.log('Категории уже существуют, пропускаем seed');
    return;
  }

  console.log('Создаем начальные категории...');

  // Корневые категории
  const rootCategories = [
    {
      nameUz: "Ta'mirlash va qurilish",
      nameRu: "Ремонт и строительство",
      descriptionUz: "Barcha turdagi ta'mirlash va qurilish ishlari",
      descriptionRu: "Все виды ремонтных и строительных работ",
      iconUrl: "🔨",
      color: "#FF5722",
      isPopular: true,
      sortOrder: 1,
      slug: "repair-construction"
    },
    {
      nameUz: "Tozalash xizmatlari",
      nameRu: "Услуги уборки",
      descriptionUz: "Professional tozalash xizmatlari",
      descriptionRu: "Профессиональные услуги уборки",
      iconUrl: "🧹",
      color: "#4CAF50",
      isPopular: true,
      sortOrder: 2,
      slug: "cleaning-services"
    },
    {
      nameUz: "Kuryer va yetkazib berish",
      nameRu: "Курьеры и доставка",
      descriptionUz: "Tez va ishonchli yetkazib berish",
      descriptionRu: "Быстрая и надежная доставка",
      iconUrl: "🚚",
      color: "#2196F3",
      isPopular: true,
      sortOrder: 3,
      slug: "delivery-courier"
    },
    {
      nameUz: "IT va frilanser",
      nameRu: "IT и фриланс",
      descriptionUz: "Raqamli xizmatlar va IT yechimlar",
      descriptionRu: "Цифровые услуги и IT решения",
      iconUrl: "💻",
      color: "#9C27B0",
      isPopular: true,
      sortOrder: 4,
      slug: "it-freelance"
    },
    {
      nameUz: "Foto va video",
      nameRu: "Фото и видео",
      descriptionUz: "Professional foto va video xizmatlar",
      descriptionRu: "Профессиональные фото и видео услуги",
      iconUrl: "📸",
      color: "#FF9800",
      isPopular: false,
      sortOrder: 5,
      slug: "photo-video"
    },
    {
      nameUz: "Ta'lim va repetitorlik",
      nameRu: "Обучение и репетиторство",
      descriptionUz: "Shaxsiy darslar va ta'lim xizmatlari",
      descriptionRu: "Индивидуальные занятия и образовательные услуги",
      iconUrl: "📚",
      color: "#607D8B",
      isPopular: false,
      sortOrder: 6,
      slug: "education-tutoring"
    },
    {
      nameUz: "Go'zallik va salomatlik",
      nameRu: "Красота и здоровье",
      descriptionUz: "Go'zallik va salomatlik xizmatlari",
      descriptionRu: "Услуги красоты и здоровья",
      iconUrl: "💄",
      color: "#E91E63",
      isPopular: false,
      sortOrder: 7,
      slug: "beauty-health"
    }
  ];

  // Создаем корневые категории
  const savedRootCategories = await categoryRepository.save(rootCategories);

  // Подкатегории для "Ремонт и строительство"
  const repairSubcategories = [
    {
      nameUz: "Elektrik ishlari",
      nameRu: "Электрика",
      descriptionUz: "Elektr jihozlarini o'rnatish va ta'mirlash",
      descriptionRu: "Установка и ремонт электрооборудования",
      parentId: savedRootCategories[0].id,
      slug: "electrical-work",
      sortOrder: 1
    },
    {
      nameUz: "Santexnika",
      nameRu: "Сантехника",
      descriptionUz: "Suv ta'minoti va kanalizatsiya ishlari",
      descriptionRu: "Водоснабжение и канализационные работы",
      parentId: savedRootCategories[0].id,
      slug: "plumbing",
      sortOrder: 2
    },
    {
      nameUz: "Konditsioner xizmatlari",
      nameRu: "Кондиционеры",
      descriptionUz: "Konditsionerlarni o'rnatish va ta'mirlash",
      descriptionRu: "Установка и ремонт кондиционеров",
      parentId: savedRootCategories[0].id,
      slug: "air-conditioning",
      sortOrder: 3
    },
    {
      nameUz: "Maishiy texnika ta'mirlash",
      nameRu: "Ремонт бытовой техники",
      descriptionUz: "Maishiy jihozlarni ta'mirlash",
      descriptionRu: "Ремонт бытовых приборов",
      parentId: savedRootCategories[0].id,
      slug: "appliance-repair",
      sortOrder: 4
    }
  ];

  // Подкатегории для "Услуги уборки"
  const cleaningSubcategories = [
    {
      nameUz: "Umumiy tozalash",
      nameRu: "Генеральная уборка",
      descriptionUz: "To'liq umumiy tozalash xizmatlari",
      descriptionRu: "Полная генеральная уборка",
      parentId: savedRootCategories[1].id,
      slug: "general-cleaning",
      sortOrder: 1
    },
    {
      nameUz: "Ofis tozalash",
      nameRu: "Уборка офисов",
      descriptionUz: "Professional ofis tozalash",
      descriptionRu: "Профессиональная уборка офисов",
      parentId: savedRootCategories[1].id,
      slug: "office-cleaning",
      sortOrder: 2
    },
    {
      nameUz: "Ta'mirdan keyin tozalash",
      nameRu: "Уборка после ремонта",
      descriptionUz: "Ta'mir ishlaridan keyin tozalash",
      descriptionRu: "Уборка после ремонтных работ",
      parentId: savedRootCategories[1].id,
      slug: "post-renovation-cleaning",
      sortOrder: 3
    }
  ];

  // Подкатегории для "IT и фриланс"
  const itSubcategories = [
    {
      nameUz: "Veb-sayt yaratish",
      nameRu: "Создание сайтов",
      descriptionUz: "Professional veb-saytlar yaratish",
      descriptionRu: "Профессиональная разработка сайтов",
      parentId: savedRootCategories[3].id,
      slug: "web-development",
      sortOrder: 1
    },
    {
      nameUz: "Mobil ilovalar",
      nameRu: "Мобильные приложения",
      descriptionUz: "Mobil ilovalar yaratish",
      descriptionRu: "Разработка мобильных приложений",
      parentId: savedRootCategories[3].id,
      slug: "mobile-apps",
      sortOrder: 2
    },
    {
      nameUz: "Grafik dizayn",
      nameRu: "Графический дизайн",
      descriptionUz: "Logo, banner va dizayn xizmatlari",
      descriptionRu: "Логотипы, баннеры и дизайн услуги",
      parentId: savedRootCategories[3].id,
      slug: "graphic-design",
      sortOrder: 3
    }
  ];

  // Сохраняем подкатегории
  const allSubcategories = [
    ...repairSubcategories,
    ...cleaningSubcategories,
    ...itSubcategories
  ];

  await categoryRepository.save(allSubcategories);

  console.log(`✅ Создано ${rootCategories.length} корневых категорий и ${allSubcategories.length} подкатегорий`);
}