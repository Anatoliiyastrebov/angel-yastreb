export interface CountryCode {
  code: string;
  dialCode: string;
  name: {
    ru: string;
    en: string;
    de: string;
  };
  flag: string;
}

export const countryCodes: CountryCode[] = [
  // Popular countries first
  { code: 'RU', dialCode: '+7', name: { ru: 'Россия', en: 'Russia', de: 'Russland' }, flag: '🇷🇺' },
  { code: 'DE', dialCode: '+49', name: { ru: 'Германия', en: 'Germany', de: 'Deutschland' }, flag: '🇩🇪' },
  { code: 'UA', dialCode: '+380', name: { ru: 'Украина', en: 'Ukraine', de: 'Ukraine' }, flag: '🇺🇦' },
  { code: 'BY', dialCode: '+375', name: { ru: 'Беларусь', en: 'Belarus', de: 'Weißrussland' }, flag: '🇧🇾' },
  { code: 'KZ', dialCode: '+7', name: { ru: 'Казахстан', en: 'Kazakhstan', de: 'Kasachstan' }, flag: '🇰🇿' },
  { code: 'US', dialCode: '+1', name: { ru: 'США', en: 'United States', de: 'Vereinigte Staaten' }, flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: { ru: 'Великобритания', en: 'United Kingdom', de: 'Vereinigtes Königreich' }, flag: '🇬🇧' },

  // A
  { code: 'AF', dialCode: '+93', name: { ru: 'Афганистан', en: 'Afghanistan', de: 'Afghanistan' }, flag: '🇦🇫' },
  { code: 'AL', dialCode: '+355', name: { ru: 'Албания', en: 'Albania', de: 'Albanien' }, flag: '🇦🇱' },
  { code: 'DZ', dialCode: '+213', name: { ru: 'Алжир', en: 'Algeria', de: 'Algerien' }, flag: '🇩🇿' },
  { code: 'AD', dialCode: '+376', name: { ru: 'Андорра', en: 'Andorra', de: 'Andorra' }, flag: '🇦🇩' },
  { code: 'AO', dialCode: '+244', name: { ru: 'Ангола', en: 'Angola', de: 'Angola' }, flag: '🇦🇴' },
  { code: 'AG', dialCode: '+1268', name: { ru: 'Антигуа и Барбуда', en: 'Antigua and Barbuda', de: 'Antigua und Barbuda' }, flag: '🇦🇬' },
  { code: 'AR', dialCode: '+54', name: { ru: 'Аргентина', en: 'Argentina', de: 'Argentinien' }, flag: '🇦🇷' },
  { code: 'AM', dialCode: '+374', name: { ru: 'Армения', en: 'Armenia', de: 'Armenien' }, flag: '🇦🇲' },
  { code: 'AU', dialCode: '+61', name: { ru: 'Австралия', en: 'Australia', de: 'Australien' }, flag: '🇦🇺' },
  { code: 'AT', dialCode: '+43', name: { ru: 'Австрия', en: 'Austria', de: 'Österreich' }, flag: '🇦🇹' },
  { code: 'AZ', dialCode: '+994', name: { ru: 'Азербайджан', en: 'Azerbaijan', de: 'Aserbaidschan' }, flag: '🇦🇿' },

  // B
  { code: 'BS', dialCode: '+1242', name: { ru: 'Багамы', en: 'Bahamas', de: 'Bahamas' }, flag: '🇧🇸' },
  { code: 'BH', dialCode: '+973', name: { ru: 'Бахрейн', en: 'Bahrain', de: 'Bahrain' }, flag: '🇧🇭' },
  { code: 'BD', dialCode: '+880', name: { ru: 'Бангладеш', en: 'Bangladesh', de: 'Bangladesch' }, flag: '🇧🇩' },
  { code: 'BB', dialCode: '+1246', name: { ru: 'Барбадос', en: 'Barbados', de: 'Barbados' }, flag: '🇧🇧' },
  { code: 'BE', dialCode: '+32', name: { ru: 'Бельгия', en: 'Belgium', de: 'Belgien' }, flag: '🇧🇪' },
  { code: 'BZ', dialCode: '+501', name: { ru: 'Белиз', en: 'Belize', de: 'Belize' }, flag: '🇧🇿' },
  { code: 'BJ', dialCode: '+229', name: { ru: 'Бенин', en: 'Benin', de: 'Benin' }, flag: '🇧🇯' },
  { code: 'BT', dialCode: '+975', name: { ru: 'Бутан', en: 'Bhutan', de: 'Bhutan' }, flag: '🇧🇹' },
  { code: 'BO', dialCode: '+591', name: { ru: 'Боливия', en: 'Bolivia', de: 'Bolivien' }, flag: '🇧🇴' },
  { code: 'BA', dialCode: '+387', name: { ru: 'Босния и Герцеговина', en: 'Bosnia and Herzegovina', de: 'Bosnien und Herzegowina' }, flag: '🇧🇦' },
  { code: 'BW', dialCode: '+267', name: { ru: 'Ботсвана', en: 'Botswana', de: 'Botswana' }, flag: '🇧🇼' },
  { code: 'BR', dialCode: '+55', name: { ru: 'Бразилия', en: 'Brazil', de: 'Brasilien' }, flag: '🇧🇷' },
  { code: 'BN', dialCode: '+673', name: { ru: 'Бруней', en: 'Brunei', de: 'Brunei' }, flag: '🇧🇳' },
  { code: 'BG', dialCode: '+359', name: { ru: 'Болгария', en: 'Bulgaria', de: 'Bulgarien' }, flag: '🇧🇬' },
  { code: 'BF', dialCode: '+226', name: { ru: 'Буркина-Фасо', en: 'Burkina Faso', de: 'Burkina Faso' }, flag: '🇧🇫' },
  { code: 'BI', dialCode: '+257', name: { ru: 'Бурунди', en: 'Burundi', de: 'Burundi' }, flag: '🇧🇮' },

  // C
  { code: 'KH', dialCode: '+855', name: { ru: 'Камбоджа', en: 'Cambodia', de: 'Kambodscha' }, flag: '🇰🇭' },
  { code: 'CM', dialCode: '+237', name: { ru: 'Камерун', en: 'Cameroon', de: 'Kamerun' }, flag: '🇨🇲' },
  { code: 'CA', dialCode: '+1', name: { ru: 'Канада', en: 'Canada', de: 'Kanada' }, flag: '🇨🇦' },
  { code: 'CV', dialCode: '+238', name: { ru: 'Кабо-Верде', en: 'Cape Verde', de: 'Kap Verde' }, flag: '🇨🇻' },
  { code: 'CF', dialCode: '+236', name: { ru: 'ЦАР', en: 'Central African Republic', de: 'Zentralafrikanische Republik' }, flag: '🇨🇫' },
  { code: 'TD', dialCode: '+235', name: { ru: 'Чад', en: 'Chad', de: 'Tschad' }, flag: '🇹🇩' },
  { code: 'CL', dialCode: '+56', name: { ru: 'Чили', en: 'Chile', de: 'Chile' }, flag: '🇨🇱' },
  { code: 'CN', dialCode: '+86', name: { ru: 'Китай', en: 'China', de: 'China' }, flag: '🇨🇳' },
  { code: 'CO', dialCode: '+57', name: { ru: 'Колумбия', en: 'Colombia', de: 'Kolumbien' }, flag: '🇨🇴' },
  { code: 'KM', dialCode: '+269', name: { ru: 'Коморы', en: 'Comoros', de: 'Komoren' }, flag: '🇰🇲' },
  { code: 'CG', dialCode: '+242', name: { ru: 'Конго', en: 'Congo', de: 'Kongo' }, flag: '🇨🇬' },
  { code: 'CD', dialCode: '+243', name: { ru: 'ДР Конго', en: 'DR Congo', de: 'DR Kongo' }, flag: '🇨🇩' },
  { code: 'CR', dialCode: '+506', name: { ru: 'Коста-Рика', en: 'Costa Rica', de: 'Costa Rica' }, flag: '🇨🇷' },
  { code: 'HR', dialCode: '+385', name: { ru: 'Хорватия', en: 'Croatia', de: 'Kroatien' }, flag: '🇭🇷' },
  { code: 'CU', dialCode: '+53', name: { ru: 'Куба', en: 'Cuba', de: 'Kuba' }, flag: '🇨🇺' },
  { code: 'CY', dialCode: '+357', name: { ru: 'Кипр', en: 'Cyprus', de: 'Zypern' }, flag: '🇨🇾' },
  { code: 'CZ', dialCode: '+420', name: { ru: 'Чехия', en: 'Czech Republic', de: 'Tschechien' }, flag: '🇨🇿' },

  // D
  { code: 'DK', dialCode: '+45', name: { ru: 'Дания', en: 'Denmark', de: 'Dänemark' }, flag: '🇩🇰' },
  { code: 'DJ', dialCode: '+253', name: { ru: 'Джибути', en: 'Djibouti', de: 'Dschibuti' }, flag: '🇩🇯' },
  { code: 'DM', dialCode: '+1767', name: { ru: 'Доминика', en: 'Dominica', de: 'Dominica' }, flag: '🇩🇲' },
  { code: 'DO', dialCode: '+1809', name: { ru: 'Доминикана', en: 'Dominican Republic', de: 'Dominikanische Republik' }, flag: '🇩🇴' },

  // E
  { code: 'EC', dialCode: '+593', name: { ru: 'Эквадор', en: 'Ecuador', de: 'Ecuador' }, flag: '🇪🇨' },
  { code: 'EG', dialCode: '+20', name: { ru: 'Египет', en: 'Egypt', de: 'Ägypten' }, flag: '🇪🇬' },
  { code: 'SV', dialCode: '+503', name: { ru: 'Сальвадор', en: 'El Salvador', de: 'El Salvador' }, flag: '🇸🇻' },
  { code: 'GQ', dialCode: '+240', name: { ru: 'Экваториальная Гвинея', en: 'Equatorial Guinea', de: 'Äquatorialguinea' }, flag: '🇬🇶' },
  { code: 'ER', dialCode: '+291', name: { ru: 'Эритрея', en: 'Eritrea', de: 'Eritrea' }, flag: '🇪🇷' },
  { code: 'EE', dialCode: '+372', name: { ru: 'Эстония', en: 'Estonia', de: 'Estland' }, flag: '🇪🇪' },
  { code: 'SZ', dialCode: '+268', name: { ru: 'Эсватини', en: 'Eswatini', de: 'Eswatini' }, flag: '🇸🇿' },
  { code: 'ET', dialCode: '+251', name: { ru: 'Эфиопия', en: 'Ethiopia', de: 'Äthiopien' }, flag: '🇪🇹' },

  // F
  { code: 'FJ', dialCode: '+679', name: { ru: 'Фиджи', en: 'Fiji', de: 'Fidschi' }, flag: '🇫🇯' },
  { code: 'FI', dialCode: '+358', name: { ru: 'Финляндия', en: 'Finland', de: 'Finnland' }, flag: '🇫🇮' },
  { code: 'FR', dialCode: '+33', name: { ru: 'Франция', en: 'France', de: 'Frankreich' }, flag: '🇫🇷' },

  // G
  { code: 'GA', dialCode: '+241', name: { ru: 'Габон', en: 'Gabon', de: 'Gabun' }, flag: '🇬🇦' },
  { code: 'GM', dialCode: '+220', name: { ru: 'Гамбия', en: 'Gambia', de: 'Gambia' }, flag: '🇬🇲' },
  { code: 'GE', dialCode: '+995', name: { ru: 'Грузия', en: 'Georgia', de: 'Georgien' }, flag: '🇬🇪' },
  { code: 'GH', dialCode: '+233', name: { ru: 'Гана', en: 'Ghana', de: 'Ghana' }, flag: '🇬🇭' },
  { code: 'GR', dialCode: '+30', name: { ru: 'Греция', en: 'Greece', de: 'Griechenland' }, flag: '🇬🇷' },
  { code: 'GD', dialCode: '+1473', name: { ru: 'Гренада', en: 'Grenada', de: 'Grenada' }, flag: '🇬🇩' },
  { code: 'GT', dialCode: '+502', name: { ru: 'Гватемала', en: 'Guatemala', de: 'Guatemala' }, flag: '🇬🇹' },
  { code: 'GN', dialCode: '+224', name: { ru: 'Гвинея', en: 'Guinea', de: 'Guinea' }, flag: '🇬🇳' },
  { code: 'GW', dialCode: '+245', name: { ru: 'Гвинея-Бисау', en: 'Guinea-Bissau', de: 'Guinea-Bissau' }, flag: '🇬🇼' },
  { code: 'GY', dialCode: '+592', name: { ru: 'Гайана', en: 'Guyana', de: 'Guyana' }, flag: '🇬🇾' },

  // H
  { code: 'HT', dialCode: '+509', name: { ru: 'Гаити', en: 'Haiti', de: 'Haiti' }, flag: '🇭🇹' },
  { code: 'HN', dialCode: '+504', name: { ru: 'Гондурас', en: 'Honduras', de: 'Honduras' }, flag: '🇭🇳' },
  { code: 'HK', dialCode: '+852', name: { ru: 'Гонконг', en: 'Hong Kong', de: 'Hongkong' }, flag: '🇭🇰' },
  { code: 'HU', dialCode: '+36', name: { ru: 'Венгрия', en: 'Hungary', de: 'Ungarn' }, flag: '🇭🇺' },

  // I
  { code: 'IS', dialCode: '+354', name: { ru: 'Исландия', en: 'Iceland', de: 'Island' }, flag: '🇮🇸' },
  { code: 'IN', dialCode: '+91', name: { ru: 'Индия', en: 'India', de: 'Indien' }, flag: '🇮🇳' },
  { code: 'ID', dialCode: '+62', name: { ru: 'Индонезия', en: 'Indonesia', de: 'Indonesien' }, flag: '🇮🇩' },
  { code: 'IR', dialCode: '+98', name: { ru: 'Иран', en: 'Iran', de: 'Iran' }, flag: '🇮🇷' },
  { code: 'IQ', dialCode: '+964', name: { ru: 'Ирак', en: 'Iraq', de: 'Irak' }, flag: '🇮🇶' },
  { code: 'IE', dialCode: '+353', name: { ru: 'Ирландия', en: 'Ireland', de: 'Irland' }, flag: '🇮🇪' },
  { code: 'IL', dialCode: '+972', name: { ru: 'Израиль', en: 'Israel', de: 'Israel' }, flag: '🇮🇱' },
  { code: 'IT', dialCode: '+39', name: { ru: 'Италия', en: 'Italy', de: 'Italien' }, flag: '🇮🇹' },
  { code: 'CI', dialCode: '+225', name: { ru: 'Кот-д\'Ивуар', en: 'Ivory Coast', de: 'Elfenbeinküste' }, flag: '🇨🇮' },

  // J
  { code: 'JM', dialCode: '+1876', name: { ru: 'Ямайка', en: 'Jamaica', de: 'Jamaika' }, flag: '🇯🇲' },
  { code: 'JP', dialCode: '+81', name: { ru: 'Япония', en: 'Japan', de: 'Japan' }, flag: '🇯🇵' },
  { code: 'JO', dialCode: '+962', name: { ru: 'Иордания', en: 'Jordan', de: 'Jordanien' }, flag: '🇯🇴' },

  // K
  { code: 'KE', dialCode: '+254', name: { ru: 'Кения', en: 'Kenya', de: 'Kenia' }, flag: '🇰🇪' },
  { code: 'KI', dialCode: '+686', name: { ru: 'Кирибати', en: 'Kiribati', de: 'Kiribati' }, flag: '🇰🇮' },
  { code: 'XK', dialCode: '+383', name: { ru: 'Косово', en: 'Kosovo', de: 'Kosovo' }, flag: '🇽🇰' },
  { code: 'KW', dialCode: '+965', name: { ru: 'Кувейт', en: 'Kuwait', de: 'Kuwait' }, flag: '🇰🇼' },
  { code: 'KG', dialCode: '+996', name: { ru: 'Кыргызстан', en: 'Kyrgyzstan', de: 'Kirgisistan' }, flag: '🇰🇬' },

  // L
  { code: 'LA', dialCode: '+856', name: { ru: 'Лаос', en: 'Laos', de: 'Laos' }, flag: '🇱🇦' },
  { code: 'LV', dialCode: '+371', name: { ru: 'Латвия', en: 'Latvia', de: 'Lettland' }, flag: '🇱🇻' },
  { code: 'LB', dialCode: '+961', name: { ru: 'Ливан', en: 'Lebanon', de: 'Libanon' }, flag: '🇱🇧' },
  { code: 'LS', dialCode: '+266', name: { ru: 'Лесото', en: 'Lesotho', de: 'Lesotho' }, flag: '🇱🇸' },
  { code: 'LR', dialCode: '+231', name: { ru: 'Либерия', en: 'Liberia', de: 'Liberia' }, flag: '🇱🇷' },
  { code: 'LY', dialCode: '+218', name: { ru: 'Ливия', en: 'Libya', de: 'Libyen' }, flag: '🇱🇾' },
  { code: 'LI', dialCode: '+423', name: { ru: 'Лихтенштейн', en: 'Liechtenstein', de: 'Liechtenstein' }, flag: '🇱🇮' },
  { code: 'LT', dialCode: '+370', name: { ru: 'Литва', en: 'Lithuania', de: 'Litauen' }, flag: '🇱🇹' },
  { code: 'LU', dialCode: '+352', name: { ru: 'Люксембург', en: 'Luxembourg', de: 'Luxemburg' }, flag: '🇱🇺' },

  // M
  { code: 'MO', dialCode: '+853', name: { ru: 'Макао', en: 'Macau', de: 'Macau' }, flag: '🇲🇴' },
  { code: 'MK', dialCode: '+389', name: { ru: 'Северная Македония', en: 'North Macedonia', de: 'Nordmazedonien' }, flag: '🇲🇰' },
  { code: 'MG', dialCode: '+261', name: { ru: 'Мадагаскар', en: 'Madagascar', de: 'Madagaskar' }, flag: '🇲🇬' },
  { code: 'MW', dialCode: '+265', name: { ru: 'Малави', en: 'Malawi', de: 'Malawi' }, flag: '🇲🇼' },
  { code: 'MY', dialCode: '+60', name: { ru: 'Малайзия', en: 'Malaysia', de: 'Malaysia' }, flag: '🇲🇾' },
  { code: 'MV', dialCode: '+960', name: { ru: 'Мальдивы', en: 'Maldives', de: 'Malediven' }, flag: '🇲🇻' },
  { code: 'ML', dialCode: '+223', name: { ru: 'Мали', en: 'Mali', de: 'Mali' }, flag: '🇲🇱' },
  { code: 'MT', dialCode: '+356', name: { ru: 'Мальта', en: 'Malta', de: 'Malta' }, flag: '🇲🇹' },
  { code: 'MH', dialCode: '+692', name: { ru: 'Маршалловы Острова', en: 'Marshall Islands', de: 'Marshallinseln' }, flag: '🇲🇭' },
  { code: 'MR', dialCode: '+222', name: { ru: 'Мавритания', en: 'Mauritania', de: 'Mauretanien' }, flag: '🇲🇷' },
  { code: 'MU', dialCode: '+230', name: { ru: 'Маврикий', en: 'Mauritius', de: 'Mauritius' }, flag: '🇲🇺' },
  { code: 'MX', dialCode: '+52', name: { ru: 'Мексика', en: 'Mexico', de: 'Mexiko' }, flag: '🇲🇽' },
  { code: 'FM', dialCode: '+691', name: { ru: 'Микронезия', en: 'Micronesia', de: 'Mikronesien' }, flag: '🇫🇲' },
  { code: 'MD', dialCode: '+373', name: { ru: 'Молдова', en: 'Moldova', de: 'Moldawien' }, flag: '🇲🇩' },
  { code: 'MC', dialCode: '+377', name: { ru: 'Монако', en: 'Monaco', de: 'Monaco' }, flag: '🇲🇨' },
  { code: 'MN', dialCode: '+976', name: { ru: 'Монголия', en: 'Mongolia', de: 'Mongolei' }, flag: '🇲🇳' },
  { code: 'ME', dialCode: '+382', name: { ru: 'Черногория', en: 'Montenegro', de: 'Montenegro' }, flag: '🇲🇪' },
  { code: 'MA', dialCode: '+212', name: { ru: 'Марокко', en: 'Morocco', de: 'Marokko' }, flag: '🇲🇦' },
  { code: 'MZ', dialCode: '+258', name: { ru: 'Мозамбик', en: 'Mozambique', de: 'Mosambik' }, flag: '🇲🇿' },
  { code: 'MM', dialCode: '+95', name: { ru: 'Мьянма', en: 'Myanmar', de: 'Myanmar' }, flag: '🇲🇲' },

  // N
  { code: 'NA', dialCode: '+264', name: { ru: 'Намибия', en: 'Namibia', de: 'Namibia' }, flag: '🇳🇦' },
  { code: 'NR', dialCode: '+674', name: { ru: 'Науру', en: 'Nauru', de: 'Nauru' }, flag: '🇳🇷' },
  { code: 'NP', dialCode: '+977', name: { ru: 'Непал', en: 'Nepal', de: 'Nepal' }, flag: '🇳🇵' },
  { code: 'NL', dialCode: '+31', name: { ru: 'Нидерланды', en: 'Netherlands', de: 'Niederlande' }, flag: '🇳🇱' },
  { code: 'NZ', dialCode: '+64', name: { ru: 'Новая Зеландия', en: 'New Zealand', de: 'Neuseeland' }, flag: '🇳🇿' },
  { code: 'NI', dialCode: '+505', name: { ru: 'Никарагуа', en: 'Nicaragua', de: 'Nicaragua' }, flag: '🇳🇮' },
  { code: 'NE', dialCode: '+227', name: { ru: 'Нигер', en: 'Niger', de: 'Niger' }, flag: '🇳🇪' },
  { code: 'NG', dialCode: '+234', name: { ru: 'Нигерия', en: 'Nigeria', de: 'Nigeria' }, flag: '🇳🇬' },
  { code: 'KP', dialCode: '+850', name: { ru: 'Северная Корея', en: 'North Korea', de: 'Nordkorea' }, flag: '🇰🇵' },
  { code: 'NO', dialCode: '+47', name: { ru: 'Норвегия', en: 'Norway', de: 'Norwegen' }, flag: '🇳🇴' },

  // O
  { code: 'OM', dialCode: '+968', name: { ru: 'Оман', en: 'Oman', de: 'Oman' }, flag: '🇴🇲' },

  // P
  { code: 'PK', dialCode: '+92', name: { ru: 'Пакистан', en: 'Pakistan', de: 'Pakistan' }, flag: '🇵🇰' },
  { code: 'PW', dialCode: '+680', name: { ru: 'Палау', en: 'Palau', de: 'Palau' }, flag: '🇵🇼' },
  { code: 'PS', dialCode: '+970', name: { ru: 'Палестина', en: 'Palestine', de: 'Palästina' }, flag: '🇵🇸' },
  { code: 'PA', dialCode: '+507', name: { ru: 'Панама', en: 'Panama', de: 'Panama' }, flag: '🇵🇦' },
  { code: 'PG', dialCode: '+675', name: { ru: 'Папуа — Новая Гвинея', en: 'Papua New Guinea', de: 'Papua-Neuguinea' }, flag: '🇵🇬' },
  { code: 'PY', dialCode: '+595', name: { ru: 'Парагвай', en: 'Paraguay', de: 'Paraguay' }, flag: '🇵🇾' },
  { code: 'PE', dialCode: '+51', name: { ru: 'Перу', en: 'Peru', de: 'Peru' }, flag: '🇵🇪' },
  { code: 'PH', dialCode: '+63', name: { ru: 'Филиппины', en: 'Philippines', de: 'Philippinen' }, flag: '🇵🇭' },
  { code: 'PL', dialCode: '+48', name: { ru: 'Польша', en: 'Poland', de: 'Polen' }, flag: '🇵🇱' },
  { code: 'PT', dialCode: '+351', name: { ru: 'Португалия', en: 'Portugal', de: 'Portugal' }, flag: '🇵🇹' },
  { code: 'PR', dialCode: '+1787', name: { ru: 'Пуэрто-Рико', en: 'Puerto Rico', de: 'Puerto Rico' }, flag: '🇵🇷' },

  // Q
  { code: 'QA', dialCode: '+974', name: { ru: 'Катар', en: 'Qatar', de: 'Katar' }, flag: '🇶🇦' },

  // R
  { code: 'RO', dialCode: '+40', name: { ru: 'Румыния', en: 'Romania', de: 'Rumänien' }, flag: '🇷🇴' },
  { code: 'RW', dialCode: '+250', name: { ru: 'Руанда', en: 'Rwanda', de: 'Ruanda' }, flag: '🇷🇼' },

  // S
  { code: 'KN', dialCode: '+1869', name: { ru: 'Сент-Китс и Невис', en: 'Saint Kitts and Nevis', de: 'St. Kitts und Nevis' }, flag: '🇰🇳' },
  { code: 'LC', dialCode: '+1758', name: { ru: 'Сент-Люсия', en: 'Saint Lucia', de: 'St. Lucia' }, flag: '🇱🇨' },
  { code: 'VC', dialCode: '+1784', name: { ru: 'Сент-Винсент и Гренадины', en: 'Saint Vincent and the Grenadines', de: 'St. Vincent und die Grenadinen' }, flag: '🇻🇨' },
  { code: 'WS', dialCode: '+685', name: { ru: 'Самоа', en: 'Samoa', de: 'Samoa' }, flag: '🇼🇸' },
  { code: 'SM', dialCode: '+378', name: { ru: 'Сан-Марино', en: 'San Marino', de: 'San Marino' }, flag: '🇸🇲' },
  { code: 'ST', dialCode: '+239', name: { ru: 'Сан-Томе и Принсипи', en: 'São Tomé and Príncipe', de: 'São Tomé und Príncipe' }, flag: '🇸🇹' },
  { code: 'SA', dialCode: '+966', name: { ru: 'Саудовская Аравия', en: 'Saudi Arabia', de: 'Saudi-Arabien' }, flag: '🇸🇦' },
  { code: 'SN', dialCode: '+221', name: { ru: 'Сенегал', en: 'Senegal', de: 'Senegal' }, flag: '🇸🇳' },
  { code: 'RS', dialCode: '+381', name: { ru: 'Сербия', en: 'Serbia', de: 'Serbien' }, flag: '🇷🇸' },
  { code: 'SC', dialCode: '+248', name: { ru: 'Сейшелы', en: 'Seychelles', de: 'Seychellen' }, flag: '🇸🇨' },
  { code: 'SL', dialCode: '+232', name: { ru: 'Сьерра-Леоне', en: 'Sierra Leone', de: 'Sierra Leone' }, flag: '🇸🇱' },
  { code: 'SG', dialCode: '+65', name: { ru: 'Сингапур', en: 'Singapore', de: 'Singapur' }, flag: '🇸🇬' },
  { code: 'SK', dialCode: '+421', name: { ru: 'Словакия', en: 'Slovakia', de: 'Slowakei' }, flag: '🇸🇰' },
  { code: 'SI', dialCode: '+386', name: { ru: 'Словения', en: 'Slovenia', de: 'Slowenien' }, flag: '🇸🇮' },
  { code: 'SB', dialCode: '+677', name: { ru: 'Соломоновы Острова', en: 'Solomon Islands', de: 'Salomonen' }, flag: '🇸🇧' },
  { code: 'SO', dialCode: '+252', name: { ru: 'Сомали', en: 'Somalia', de: 'Somalia' }, flag: '🇸🇴' },
  { code: 'ZA', dialCode: '+27', name: { ru: 'ЮАР', en: 'South Africa', de: 'Südafrika' }, flag: '🇿🇦' },
  { code: 'KR', dialCode: '+82', name: { ru: 'Южная Корея', en: 'South Korea', de: 'Südkorea' }, flag: '🇰🇷' },
  { code: 'SS', dialCode: '+211', name: { ru: 'Южный Судан', en: 'South Sudan', de: 'Südsudan' }, flag: '🇸🇸' },
  { code: 'ES', dialCode: '+34', name: { ru: 'Испания', en: 'Spain', de: 'Spanien' }, flag: '🇪🇸' },
  { code: 'LK', dialCode: '+94', name: { ru: 'Шри-Ланка', en: 'Sri Lanka', de: 'Sri Lanka' }, flag: '🇱🇰' },
  { code: 'SD', dialCode: '+249', name: { ru: 'Судан', en: 'Sudan', de: 'Sudan' }, flag: '🇸🇩' },
  { code: 'SR', dialCode: '+597', name: { ru: 'Суринам', en: 'Suriname', de: 'Suriname' }, flag: '🇸🇷' },
  { code: 'SE', dialCode: '+46', name: { ru: 'Швеция', en: 'Sweden', de: 'Schweden' }, flag: '🇸🇪' },
  { code: 'CH', dialCode: '+41', name: { ru: 'Швейцария', en: 'Switzerland', de: 'Schweiz' }, flag: '🇨🇭' },
  { code: 'SY', dialCode: '+963', name: { ru: 'Сирия', en: 'Syria', de: 'Syrien' }, flag: '🇸🇾' },

  // T
  { code: 'TW', dialCode: '+886', name: { ru: 'Тайвань', en: 'Taiwan', de: 'Taiwan' }, flag: '🇹🇼' },
  { code: 'TJ', dialCode: '+992', name: { ru: 'Таджикистан', en: 'Tajikistan', de: 'Tadschikistan' }, flag: '🇹🇯' },
  { code: 'TZ', dialCode: '+255', name: { ru: 'Танзания', en: 'Tanzania', de: 'Tansania' }, flag: '🇹🇿' },
  { code: 'TH', dialCode: '+66', name: { ru: 'Таиланд', en: 'Thailand', de: 'Thailand' }, flag: '🇹🇭' },
  { code: 'TL', dialCode: '+670', name: { ru: 'Восточный Тимор', en: 'Timor-Leste', de: 'Osttimor' }, flag: '🇹🇱' },
  { code: 'TG', dialCode: '+228', name: { ru: 'Того', en: 'Togo', de: 'Togo' }, flag: '🇹🇬' },
  { code: 'TO', dialCode: '+676', name: { ru: 'Тонга', en: 'Tonga', de: 'Tonga' }, flag: '🇹🇴' },
  { code: 'TT', dialCode: '+1868', name: { ru: 'Тринидад и Тобаго', en: 'Trinidad and Tobago', de: 'Trinidad und Tobago' }, flag: '🇹🇹' },
  { code: 'TN', dialCode: '+216', name: { ru: 'Тунис', en: 'Tunisia', de: 'Tunesien' }, flag: '🇹🇳' },
  { code: 'TR', dialCode: '+90', name: { ru: 'Турция', en: 'Turkey', de: 'Türkei' }, flag: '🇹🇷' },
  { code: 'TM', dialCode: '+993', name: { ru: 'Туркменистан', en: 'Turkmenistan', de: 'Turkmenistan' }, flag: '🇹🇲' },
  { code: 'TV', dialCode: '+688', name: { ru: 'Тувалу', en: 'Tuvalu', de: 'Tuvalu' }, flag: '🇹🇻' },

  // U
  { code: 'UG', dialCode: '+256', name: { ru: 'Уганда', en: 'Uganda', de: 'Uganda' }, flag: '🇺🇬' },
  { code: 'AE', dialCode: '+971', name: { ru: 'ОАЭ', en: 'United Arab Emirates', de: 'Vereinigte Arabische Emirate' }, flag: '🇦🇪' },
  { code: 'UY', dialCode: '+598', name: { ru: 'Уругвай', en: 'Uruguay', de: 'Uruguay' }, flag: '🇺🇾' },
  { code: 'UZ', dialCode: '+998', name: { ru: 'Узбекистан', en: 'Uzbekistan', de: 'Usbekistan' }, flag: '🇺🇿' },

  // V
  { code: 'VU', dialCode: '+678', name: { ru: 'Вануату', en: 'Vanuatu', de: 'Vanuatu' }, flag: '🇻🇺' },
  { code: 'VA', dialCode: '+379', name: { ru: 'Ватикан', en: 'Vatican City', de: 'Vatikanstadt' }, flag: '🇻🇦' },
  { code: 'VE', dialCode: '+58', name: { ru: 'Венесуэла', en: 'Venezuela', de: 'Venezuela' }, flag: '🇻🇪' },
  { code: 'VN', dialCode: '+84', name: { ru: 'Вьетнам', en: 'Vietnam', de: 'Vietnam' }, flag: '🇻🇳' },

  // Y
  { code: 'YE', dialCode: '+967', name: { ru: 'Йемен', en: 'Yemen', de: 'Jemen' }, flag: '🇾🇪' },

  // Z
  { code: 'ZM', dialCode: '+260', name: { ru: 'Замбия', en: 'Zambia', de: 'Sambia' }, flag: '🇿🇲' },
  { code: 'ZW', dialCode: '+263', name: { ru: 'Зимбабве', en: 'Zimbabwe', de: 'Simbabwe' }, flag: '🇿🇼' },
];

export const getCountryByCode = (code: string): CountryCode | undefined => {
  return countryCodes.find(country => country.code === code);
};

export const getCountryByDialCode = (dialCode: string): CountryCode | undefined => {
  return countryCodes.find(country => country.dialCode === dialCode);
};

export const defaultCountryCode = 'DE';
