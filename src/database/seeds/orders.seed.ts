import { DataSource } from 'typeorm';
import { Order, OrderStatus, OrderPriceType, OrderUrgency } from '../../modules/orders/entities/order.entity';
import { User } from '../../modules/users/entities/user.entity';
import { ServiceCategory } from '../../modules/categories/entities/service-category.entity';

export async function seedOrders(dataSource: DataSource): Promise<void> {
  const orderRepository = dataSource.getRepository(Order);
  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(ServiceCategory);
  
  // Проверяем, есть ли уже заказы
  const existingOrders = await orderRepository.count();
  if (existingOrders > 0) {
    console.log('Заказы уже существуют, пропускаем seed');
    return;
  }

  // Получаем пользователей и категории
  const users = await userRepository.find();
  const categories = await categoryRepository.find();

  if (users.length === 0 || categories.length === 0) {
    console.log('Нет пользователей или категорий для создания заказов');
    return;
  }

  console.log('Создаем тестовые заказы...');

  const sampleOrders = [
    {
      customerId: users[0]?.id,
      categoryId: categories[0]?.id,
      title: "Ремонт кондиционера Samsung",
      description: "Кондиционер не охлаждает, нужна диагностика и ремонт",
      priceType: OrderPriceType.FIXED,
      budgetFrom: 200000,
      budgetTo: 500000,
      urgency: OrderUrgency.MEDIUM,
      address: "г. Ташкент, Юнусабадский район, ул. Амира Темура 15",
      locationLat: 41.2995,
      locationLng: 69.2401,
      status: OrderStatus.OPEN,
      isPublished: true,
    },
    {
      customerId: users[0]?.id,
      categoryId: categories[1]?.id,
      title: "Генеральная уборка квартиры",
      description: "Нужна генеральная уборка 3-комнатной квартиры после ремонта",
      priceType: OrderPriceType.NEGOTIABLE,
      urgency: OrderUrgency.LOW,
      address: "г. Ташкент, Мирзо-Улугбекский район",
      locationLat: 41.3111,
      locationLng: 69.2797,
      status: OrderStatus.OPEN,
      isPublished: true,
    }
  ];

  await orderRepository.save(sampleOrders);
  console.log(`✅ Создано ${sampleOrders.length} тестовых заказов`);
}