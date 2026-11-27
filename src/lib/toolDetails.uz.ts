import type { ToolDetail } from './toolDetails'

/** Подробные тексты страниц инструментов на узбекском. */
export const UZ: Record<string, ToolDetail> = {
  'pdf-to-word': {
    intro: [
      "PDF hujjat har qurilmada bir xil ko'rinishi uchun yaratilgan, shuning uchun uni tahrirlash noqulay: abzats, jadval va shriftlar Word dagidek saqlanmaydi. Konverter sahifa ichidagi matn, shrift o'lchami, ustunlar va jadvallarni qayta yig'ib, tahrirlanadigan .docx fayl beradi.",
      "Natijada matn rasm emas, oddiy matn bo'lib qoladi: uni belgilash, qidirish va o'zgartirish mumkin. Fayl Word, Google Docs va LibreOffice da ochiladi. Hisoblash brauzerda bajariladi — hujjat serverga yuborilmaydi.",
    ],
    useCases: [
      {
        title: "Boshqa tomondan kelgan hujjatni tuzatish",
        text: "Shartnoma yoki smeta PDF da kelgan, bir necha bandni o'zgartirish kerak. Word ga o'tkazing, tahrirlang va yana PDF qilib saqlang.",
      },
      {
        title: 'Rezyume va portfolio',
        text: "Ish beruvchi «Word da rezyume» so'raydi, sizda esa tayyor PDF bor. Matnni qaytadan terish shart emas.",
      },
      {
        title: "O'quv materiallari",
        text: "Ma'ruza va topshiriqlarga izoh yozish osonroq: .docx ichida matn yoniga konspekt qo'shish mumkin.",
      },
    ],
    steps: [
      {
        title: 'PDF ni oching',
        text: "Faylni ramkaga tashlang yoki bosib qurilmadan tanlang. Bitta fayl — 100 MB gacha va 200 sahifagacha.",
      },
      {
        title: 'Sahifalar tahlil qilinishini kuting',
        text: "Brauzer matn qatlami, shriftlar va bloklar joylashuvini o'qiydi. Katta hujjatlar uchun jarayon ko'rsatkichi va «Bekor qilish» tugmasi bor.",
      },
      {
        title: 'Murakkab joylarni tekshiring',
        text: "Jadvallar, ikki ustunli tuzilma va imzolar eng nozik elementlar. Word da ularni ko'zdan kechiring.",
      },
      {
        title: 'Faylni yuklab oling',
        text: ".docx tayyor bo'lishi bilan saqlanadi. Ro'yxatdan o'tish, pochta va to'lov kerak emas.",
      },
    ],
    example: {
      title: 'Misol: 24 sahifali uslubiy qo‘llanma',
      text: "Kirishda matn, uchta jadval va oltita sxema bor PDF. Natijada matn tahrirlanadigan, jadvallar jadval bo'lib qolgan, sxemalar rasm sifatida joylashgan .docx olinadi. Matn qatlami yo'q skan uchun natija boshqacha bo'ladi: bunday sahifalar rasm bo'lib tushadi.",
    },
    tips: [
      {
        title: 'Skan — bu matn emas',
        text: "Skanerlangan yoki suratga olingan PDF da matn qatlami bo'lmaydi. Sahifalar rasm bo'lib qo'shiladi, matnni tahrirlash uchun avval OCR kerak.",
      },
      {
        title: 'Izohlar va kolontitullar',
        text: "Ular sahifa oxiriga yoki abzats boshiga ko'chishi mumkin. Bu formatning xususiyati — birinchi va oxirgi sahifani tekshiring.",
      },
    ],
    limits:
      "Vosita skandagi matnni tanimaydi, interaktiv forma, imzo va murakkab vektor chizmalarni bir xil ko'chirmaydi. Murakkab grafikani PDF da qoldirib, Word ga faqat matnni chiqarish ishonchliroq.",
    faq: [
      {
        q: "Biror narsa o'rnatish kerakmi?",
        a: "Yo'q. Konvertatsiya brauzerda, sizning qurilmangizda bajariladi: kengaytma ham, dastur ham, ro'yxatdan o'tish ham kerak emas.",
      },
      {
        q: 'Faylim qayerga tushadi?',
        a: "Hech qayerga. PDF lokal o'qiladi va serverga yuborilmaydi, shuning uchun biz uni saqlay olmaymiz.",
      },
      {
        q: "Nega PDF dagi matn ajratilmaydi, Word da esa tahrirlanadi?",
        a: "PDF da har bir belgi sahifadagi koordinataga bog'langan. Konverter ulardan satr va abzats yasaydi — shunda oddiy matn paydo bo'ladi.",
      },
    ],
  },

  'compress-pdf': {
    intro: [
      "PDF hajmi asosan skan va fotosuratlardan o'sadi: telefonda olingan bitta sahifa 3–5 MB bo'lishi mumkin. Siqish har bir sahifani tanlangan sifat va masshtabda JPEG ga qayta yig'adi, natijada fayl bir necha barobar kichrayadi, matn esa o'qiladigan bo'lib qoladi.",
      "Vosita oflayn, oyna ichida ishlaydi. Agar qayta yig'ishdan keyin fayl kattaroq chiqsa (rasmlari kam «yengil» PDF larda shunday bo'ladi), xizmat halol tarzda asl faylni o'zgartirmasdan qaytaradi va buni aytadi.",
    ],
    useCases: [
      {
        title: 'Pochta va messenjerlar',
        text: "Pochta xizmatlarida ilova chegarasi 10–25 MB. 30 MB lik skan sig'maydi, siqqandan keyin esa bemalol sig'adi.",
      },
      {
        title: 'Portalga yuklash',
        text: "Davlat xizmatlari va banklar ko'pincha 5 MB gacha PDF so'raydi. Uch rejim limitga tushishga yordam beradi.",
      },
      {
        title: 'Sayt va taqdimot',
        text: "Og'ir PDF foydalanuvchida sekin ochiladi. Siqilgan versiya tezroq yuklanadi va mobil trafikni tejaydi.",
      },
    ],
    steps: [
      {
        title: 'Rejimni tanlang',
        text: "«Kuchli — ekran uchun» hajmni maksimal kamaytiradi, «O'rtacha» — muvozanat, «Ehtiyotkor — chop etish uchun» yuqori sifatni saqlaydi.",
      },
      {
        title: 'PDF qo‘shing',
        text: "Faylni oynaga tashlang. 100 MB gacha va 200 sahifagacha hujjat mos keladi.",
      },
      {
        title: 'Natijani ko‘ring',
        text: "Ishlovdan keyin asl va tayyor fayl hajmi ko'rsatiladi. Foyda bo'lmasa, asl nusxa yuklanadi.",
      },
      {
        title: 'Yuklab olib tekshiring',
        text: "Tayyor PDF ni ochib varaqlang: matn o'qilishi kerak, chop etish uchun «Ehtiyotkor» rejimi mos.",
      },
    ],
    example: {
      title: 'Misol: 18 sahifali shartnoma skani',
      text: "Asl fayl 27 MB, telefonda olingan. «O'rtacha» rejimida 4–6 MB chiqadi: band raqamlari va imzolar o'qiladi. Chop etish uchun «Ehtiyotkor», messenjerga yuborish uchun «Kuchli» yetarli.",
    },
    tips: [
      {
        title: 'Nusxani siqing',
        text: "Qayta yig'ish qaytarilmaydi: asl sifatga qaytib bo'lmaydi. Natija ma'qul bo'lmaguncha asl faylni saqlab turing.",
      },
      {
        title: 'Vektor PDF',
        text: "Hujjat faqat matn va chiziqlardan iborat bo'lsa, siqish foyda bermasligi mumkin — sahifalar rasmga aylanadi. Shunday holatda faylni o'zgartirmagan ma'qul.",
      },
    ],
    limits:
      "Siqish matn qatlamini saqlab qolmaydi: qayta yig'ilgandan keyin sahifalar rasm bo'ladi va matn bo'yicha qidiruv ishlamaydi. Ichki havolalar va interaktiv elementlar ham yo'qoladi.",
    faq: [
      {
        q: 'Fayl qancha kichrayadi?',
        a: "Mazmunga bog'liq. Skan va fotosuratlar 3–10 barobar kichrayadi, «yengil» matnli PDF esa deyarli o'zgarmaydi — unda asl fayl qaytariladi.",
      },
      {
        q: 'Matn xira bo‘lib qolmaydimi?',
        a: "«Ehtiyotkor» rejimida yo'q, u chop etishga mo'ljallangan. «Kuchli» mayda detallarni yumshatadi, lekin eng kichik hajmni beradi.",
      },
      {
        q: 'Fayl dasturlar uchun o‘qiladigan bo‘lib qoladimi?',
        a: "Ha, bu sahifalari rasm bo'lgan oddiy PDF. Faqat avtomatik matn aniqlash ishlamaydi — matn qatlami yo'q.",
      },
    ],
  },

  'pdf-editor': {
    intro: [
      "Tahrirlovchi PDF ni sahifalar to'plami sifatida ochadi va konvertatsiyasiz tuzatish imkonini beradi: xato harfni to'g'rilash, ortiqcha imzoni yopish, rasm yoki bo'sh varaq qo'shish, boshqalarning izoh va shtamplarini o'chirish. Hammasi brauzerda bajariladi — hujjat qurilmangizda qoladi.",
      "Chapda sahifalar ro'yxati, markazda ish maydoni, o'ngda tanlangan obyekt xossalari. Natija oddiy dasturdagi kabi haqiqiy PDF bo'lib yig'iladi, rasm emas.",
    ],
    useCases: [
      {
        title: 'Tayyor hujjatdagi xato',
        text: "Bitta harfni tuzatish kerak, asl fayl esa yo'q. Matnni PDF ichida belgilab, to'g'ri variantni yozing.",
      },
      {
        title: 'Ortiqchasini yashirish',
        text: "Boshqa odamning imzosi, «qoralama» shtampi yoki hamkasb izohini olib tashlang — sahifaning qolgan qismi o'zgarmaydi.",
      },
      {
        title: 'Sahifa qo‘shish',
        text: "Izoh uchun bo'sh varaq, chek fotosi yoki shartnomaga ilova skanini qo'shing.",
      },
    ],
    steps: [
      {
        title: 'Tahrirlovchini oching',
        text: "/editor sahifasida 100 MB gacha PDF yuklang. Birinchi sahifa bir necha soniyada ko'rinadi.",
      },
      {
        title: 'Obyektni tanlang',
        text: "Matn, rasm yoki belgiga bosing. O'ngda shrift, o'lcham, rang va joylashuv paydo bo'ladi.",
      },
      {
        title: 'O‘zgartirish kiriting',
        text: "Matnni tuzating, rasm qo'shing, bo'sh sahifa qo'shing yoki izohlarni o'chiring. Har bir amalni «Orqaga» bilan qaytarish mumkin.",
      },
      {
        title: 'PDF ni yuklab oling',
        text: "«PDF yuklab olish» tugmasini bosing — tahrirlovchi o'zgarishlar bilan yangi fayl yig'adi.",
      },
    ],
    example: {
      title: 'Misol: rekvizitlarda xato bo‘lgan shartnoma',
      text: "PDF da hisob raqami noto'g'ri. Hujjatni tahrirlovchida ochamiz, satrni belgilab, o'sha shrift va o'lchamda to'g'ri raqamlarni yozamiz va yuklab olamiz. Qolgan sahifalar va imzolar joyida qoladi.",
    },
    tips: [
      {
        title: 'Hammasi matn emas',
        text: "Agar hujjat skan bo'lsa, sahifadagi «matn» aslida rasm. Uni tahrirlab bo'lmaydi, lekin oq plashka bilan yopib, ustiga yozish mumkin.",
      },
      {
        title: 'Shriftni tekshiring',
        text: "Tuzatish uchun o'xshash shriftlar taklif qilinadi. Satr «surilib» ketsa, o'lchamni qo'lda moslang.",
      },
    ],
    limits:
      "Tahrirlovchi Acrobat o'rnini bosmaydi: forma yaratmaydi, elektron imzo qo'ymaydi va skandagi matnni tanimaydi. U nuqtali tuzatishlar uchun: matn, rasm, sahifa va izohlar.",
    faq: [
      {
        q: 'Skanni tahrirlash mumkinmi?',
        a: "To'g'ridan-to'g'ri yo'q, skanda matn qatlami bo'lmaydi. Izohlarni o'chirish, plashka va ustidan matn yozish yoki avval OCR qilish mumkin.",
      },
      {
        q: 'Necha sahifani ko‘taradi?',
        a: "Brauzer uchun amaliy chegara — 200 sahifa va 100 MB. Katta fayllar sekinroq ochiladi.",
      },
      {
        q: 'Sifat saqlanadimi?',
        a: "Ha, sahifalar rasmga qayta siqilmaydi: matn va grafika asl holida qoladi.",
      },
    ],
  },

  'extract-images': {
    intro: [
      "PDF ichida alohida rasmlar yotadi: mahsulot fotosi, sxema, logotip, muhr skani. Vosita ularni asl o'lchamda chiqarib, ZIP arxivga yig'adi — skrinshot, kesish va sifat yo'qotishsiz.",
      "Vosita sahifani qayta chizmaydi, ichki rastr rasmlarni qidiradi. Ya'ni hujjatga qo'shilgan aynan o'sha fayllarni olasiz: haqiqiy o'lcham va format bilan (JPEG, PNG, TIFF).",
    ],
    useCases: [
      {
        title: 'Katalogdagi rasmlar',
        text: "Sayt uchun narxlar ro'yxati yoki katalogdagi rasmlar kerak — ularni birma-bir skrinshot qilmasdan to'plam bilan oling.",
      },
      {
        title: 'Taqdimot materiallari',
        text: "Hisobot yoki maqoladan sxema va grafikalar kerak. Arxivni olish qo'lda kesishdan tezroq.",
      },
      {
        title: 'Skan va muhrlar',
        text: "Ko'p sahifali skan PDF dan alohida rasmlarni arxiv yoki tekshiruv uchun chiqarish mumkin.",
      },
    ],
    steps: [
      {
        title: 'PDF qo‘shing',
        text: "Bitta faylni yoki bir nechta faylni tashlang (10 tagacha, jami 200 sahifagacha). Har biri 100 MB dan oshmasin.",
      },
      {
        title: 'Rasmlar qidirilishini kuting',
        text: "Brauzer sahifalarni aylanib, ichki rasmlarni yig'adi. Jarayon yuklanish chizig'ida ko'rinadi.",
      },
      {
        title: 'Arxivni oling',
        text: "Topilgan rasmlar bitta ZIP da yuklanadi. Bir nechta PDF uchun arxiv ichida alohida papkalar bo'ladi.",
      },
      {
        title: 'Natijani tekshiring',
        text: "Arxiv yuklanmasa, PDF da rastr rasmlar yo'q — faqat matn va vektor grafika. Xizmat buni oynada aytadi.",
      },
    ],
    example: {
      title: 'Misol: 40 sahifali katalog',
      text: "PDF da 120 ta mahsulot fotosi bor. Natijada 120 faylli arxiv olinadi: katalogdagi o'lchamlar saqlanadi, qayta siqish yo'q. Sahifani rasm sifatida olsangiz, sifat yomonroq bo'lardi.",
    },
    tips: [
      {
        title: 'Vektor rasmlar',
        text: "Chiziqlar bilan chizilgan logotip va diagrammalar rasm hisoblanmaydi: ularni chiqarib bo'lmaydi. Ular uchun PDF → JPG mos.",
      },
      {
        title: 'Takrorlar',
        text: "Har sahifadagi bir xil logotip arxivda bir necha marta tushishi mumkin — vosita faylda nima bo'lsa, shuni chiqaradi.",
      },
    ],
    limits:
      "Vosita matn, jadval va vektor grafikani chiqarmaydi, rasmlar mazmunini tanimaydi va PDF siqilganda sahifaga «yopishib» qolgan rasmlarni tiklamaydi.",
    faq: [
      {
        q: 'Nega arxiv bo‘sh?',
        a: "Demak hujjatda ichki rastr rasmlar yo'q: faqat matn, chiziqlar va diagrammalar. Sahifa rasmlari uchun PDF → JPG dan foydalaning.",
      },
      {
        q: 'Sifat yo‘qoladimi?',
        a: "Yo'q. Rasmlar PDF da qanday saqlangan bo'lsa, shunday ko'chiriladi.",
      },
      {
        q: 'Bir nechta PDF dan rasm olish mumkinmi?',
        a: "Ha, 10 faylgacha. Arxivda alohida papkalar bo'ladi, bir xil nomli fayllar bir-birini bosmaydi.",
      },
    ],
  },

  'merge-pdf': {
    intro: [
      "Birlashtirish bir nechta PDF ni ro'yxatdagi tartibda bitta hujjatga yig'adi. Sahifalar qayta siqilmaydi: matn, rasm va havolalar asl holida qoladi.",
      "Hujjat bo'lib-bo'lib kelganda qulay: shartnoma alohida, ilovalar alohida, imzolar skani alohida. Xatda uchta ilova o'rniga bitta fayl bo'ladi.",
    ],
    useCases: [
      {
        title: 'Ilovalari bilan shartnoma',
        text: "Asosiy matn, spetsifikatsiya va imzolar skani — to'g'ri tartibda bitta PDF da.",
      },
      {
        title: "Bir necha qismdan hisobot",
        text: "Har bob alohida saqlangan — yuborishdan oldin ularni bitta hujjatga yig'ing.",
      },
    ],
    steps: [
      {
        title: 'Fayllarni qo‘shing',
        text: "Bir nechta PDF ni tashlang. Ro'yxatdagi tartib — yakuniy hujjatdagi sahifalar tartibi.",
      },
      {
        title: 'Ro‘yxatni tekshiring',
        text: "Ortiqchasini olib tashlang va fayllarni boblar tartibida joylashtiring.",
      },
      {
        title: 'Hujjatni yig‘ing',
        text: "«Bitta PDF ga birlashtirish» tugmasini bosing va ishlov tugashini kuting.",
      },
      {
        title: 'Natijani yuklab oling',
        text: "Tayyor fayl darhol saqlanadi. Asl hujjatlar o'zgarmaydi.",
      },
    ],
    tips: [
      {
        title: 'Turli sahifa o‘lchamlari',
        text: "A4 va A5 ni birlashtirish mumkin: har varaq o'z o'lchamida qoladi, lekin chop etishda buni hisobga oling.",
      },
      {
        title: 'Raqamlash',
        text: "Fayllar ichidagi sahifa raqamlari qayta hisoblanmaydi: uzluksiz raqamlash kerak bo'lsa, birlashtirgandan keyin qo'shing.",
      },
    ],
    faq: [
      {
        q: 'Havolalar saqlanadimi?',
        a: "Ichki va sahifalararo havolalar saqlanadi. Turli fayllardagi xatcho'plar bitta daraxtga birlashmaydi.",
      },
      {
        q: 'Parol bilan himoyalangan PDF ni birlashtirish mumkinmi?',
        a: "Avval parolli PDF ni ochib, himoyasiz saqlash kerak — aks holda brauzer sahifalarni o'qiy olmaydi.",
      },
    ],
  },

  'split-pdf': {
    intro: [
      "Bo'lish bitta PDF ni sahifa diapazonlari bo'yicha qismlarga ajratadi. Vazifalar oddiy: har bo'limga o'z sahifalarini berish, katta hisobotdan ilovani ajratib olish, ortiqcha varaqlarni olib tashlash.",
      "Sahifalar qayta chizilmaydi va sifat yo'qolmaydi: vosita ularni yangi hujjatlarga o'z holida ko'chiradi.",
    ],
    useCases: [
      {
        title: 'Bo‘limlar bo‘yicha hujjatlar',
        text: "Umumiy arizalar PDF idan har kimga faqat o'z sahifalari kerak — faylni diapazonlar bo'yicha kesing.",
      },
      {
        title: 'Faqat kerakli bob',
        text: "100 sahifali kitob yoki yo'riqnomadan bitta bob kerak: uni alohida fayl qilib saqlang.",
      },
    ],
    steps: [
      {
        title: 'PDF ni oching',
        text: "200 sahifagacha hujjat qo'shing. Brauzer darhol sahifalar sonini ko'rsatadi.",
      },
      {
        title: 'Diapazonlarni yozing',
        text: "Masalan, «1-3, 5» — uch sahifali birinchi qism va beshinchi sahifa alohida fayl. Har diapazon alohida PDF bo'ladi.",
      },
      {
        title: 'Bo‘lishni boshlang',
        text: "Tugmani bosing va ishlov tugashini kuting. Bir nechta qism bo'lsa, natija arxiv bilan keladi.",
      },
      {
        title: 'Fayllarni yuklab oling',
        text: "Tayyor PDF lar darhol saqlanadi, asl fayl o'zgarmaydi.",
      },
    ],
    tips: [
      {
        title: 'Diapazon sintaksisi',
        text: "Raqamlarni vergul bilan, oraliqni defis bilan yozing. Bo'sh joy mumkin, tartib ixtiyoriy.",
      },
      {
        title: 'Bo‘sh sahifalar',
        text: "Diapazon hujjat oxiridan keyin boshlansa, xizmat ogohlantiradi: raqamlarni tekshiring.",
      },
    ],
    faq: [
      {
        q: 'Har sahifani alohida ajratish mumkinmi?',
        a: "Ha, kichik hujjatlar uchun «1,2,3» ko'rinishidagi diapazonlar yetarli. Katta fayllar uchun «Sahifalarni ajratish» va PDF → JPG qulayroq.",
      },
      {
        q: 'Sifat yo‘qoladimi?',
        a: "Yo'q: sahifalar qayta siqilmasdan ko'chiriladi, matn matn bo'lib qoladi.",
      },
    ],
  },

  'jpg-to-pdf': {
    intro: [
      "JPG yoki PNG sifatida saqlangan foto va skanlar ko'pincha aynan PDF ko'rinishida talab qilinadi: banklar, universitetlar va davlat portallari shunday qabul qiladi. Vosita har bir rasmni alohida sahifaga joylab, bitta hujjat yig'adi.",
      "Sahifa o'lchamini A4, Letter yoki «rasm o'lchamida» tanlash mumkin. Oxirgi variantda PDF chekkalarsiz va ortiqcha oq joylarsiz chiqadi.",
    ],
    useCases: [
      {
        title: 'Pasport yoki ma’lumotnoma skani',
        text: "Telefonda olingan bir nechta foto yuborish uchun bitta tartibli PDF ga aylanadi.",
      },
      {
        title: 'Portfolio va ishlar',
        text: "Rasmlar seriyasi bir xil sahifa o'lchamidagi hujjatga yig'iladi.",
      },
    ],
    steps: [
      {
        title: 'Sahifa o‘lchamini tanlang',
        text: "A4 — chop etish va hujjatlar uchun, Letter — AQSh uchun, «Rasm o'lchamida» — chekkalarsiz.",
      },
      {
        title: 'Rasmlarni qo‘shing',
        text: "Bir nechta JPG va PNG tanlash mumkin: ular qo'shilgan tartibda joylashadi.",
      },
      {
        title: 'PDF yig‘ing',
        text: "«PDF yig'ish» tugmasini bosing va ishlov tugashini kuting — rasmlar qayta siqilmaydi.",
      },
      {
        title: 'Faylni yuklab oling',
        text: "Tayyor PDF darhol saqlanadi. Asl fotolar sizda qoladi.",
      },
    ],
    tips: [
      {
        title: 'Tartib muhim',
        text: "Yig'ishdan oldin fotolar ketma-ketligini tekshiring: tayyor PDF da sahifalarni almashtirish qiyinroq.",
      },
      {
        title: 'Yo‘nalish',
        text: "Yonboshlab olingan foto yonboshlab qoladi: yuklashdan oldin aylantiring yoki tahrirlovchida sahifani burang.",
      },
    ],
    faq: [
      {
        q: 'PNG qo‘llab-quvvatlanadimi?',
        a: "Ha, JPG va PNG. PNG shaffofligi oq rang bilan to'ldiriladi, chop etishdagidek.",
      },
      {
        q: 'Foto sifati pasayadimi?',
        a: "Yo'q, rasmlar qayta siqilmasdan qo'shiladi. Tayyor fayl hajmi rasmlar yig'indisiga teng bo'ladi.",
      },
    ],
  },

  'pdf-to-jpg': {
    intro: [
      "PDF → JPG har bir sahifani tanlangan sifatda rasmga aylantiradi. Bu PDF ni boshqa qurilmada ochib bo'lmaganda, sahifani messenjerga yuborish yoki taqdimotga qo'shish kerak bo'lganda foydali.",
      "Barcha sahifalar ZIP arxivga yig'iladi. Rasmdagi matn o'qiladi, lekin endi matn emas: uni tahrirlash va qidirish mumkin bo'lmaydi.",
    ],
    useCases: [
      {
        title: 'Hujjat ko‘rinishi',
        text: "Birinchi sahifa rasm sifatida — mahsulot kartasi yoki xat uchun qulay muqova.",
      },
      {
        title: 'Ijtimoiy tarmoqlar',
        text: "PDF sahifasi JPG bo'lib post yoki storisga qo'shiladi, qo'shimcha dastur kerak emas.",
      },
    ],
    steps: [
      {
        title: 'Sifatni tanlang',
        text: "«Ixcham» tez yuborish uchun, «Oddiy» ekran uchun, «Maksimum» chop etish va katta ekranlar uchun.",
      },
      {
        title: 'PDF qo‘shing',
        text: "Hujjatni oynaga tashlang: 200 sahifagacha fayl mos keladi.",
      },
      {
        title: 'Chizilishini kuting',
        text: "Sahifalar navbat bilan chiziladi, jarayon yuklanish chizig'ida ko'rinadi.",
      },
      {
        title: 'Arxivni yuklab oling',
        text: "ZIP ichida «sahifa-1.jpg», «sahifa-2.jpg» kabi fayllar bo'ladi.",
      },
    ],
    tips: [
      {
        title: 'Arxiv hajmi',
        text: "«Maksimum» sifatda 100 sahifali hujjat yuzlab megabayt bo'lishi mumkin. Yuborish uchun «Ixcham» ni tanlang.",
      },
      {
        title: 'Matn kerak bo‘lsa',
        text: "Rasmlardan keyin matn kerak bo'lsa, uni alohida tanishtirish kerak: JPG matn qatlamini saqlamaydi.",
      },
    ],
    faq: [
      {
        q: 'PNG olish mumkinmi?',
        a: "Hozir natija — JPG: u ixchamroq va ko'p vazifalarga mos. PDF sahifalariga shaffoflik kerak emas.",
      },
      {
        q: 'Qaysi masshtabni tanlash kerak?',
        a: "«Oddiy» ekranda o'qish uchun mos, «Maksimum» chop etish yoki kattalashtirish uchun.",
      },
    ],
  },
}
