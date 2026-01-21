<?php

namespace Database\Seeders\helpers;

class YemeniDataHelper
{
    /**
     * Get a random Yemeni Arabic name
     */
    public static function yemeniName(): string
    {
        $maleFirstNames = [
            'أحمد', 'محمد', 'علي', 'عبدالله', 'يوسف', 'خالد', 'عمر', 'حسن',
            'محمود', 'إبراهيم', 'عبدالرحمن', 'عبدالعزيز', 'سعيد', 'طارق', 'ناصر',
            'فهد', 'صالح', 'عبدالوهاب', 'عبدالسلام', 'عبدالكريم', 'عبدالرزاق',
            'عبدالغني', 'عبدالملك', 'عبدالهادي', 'عبدالخالق', 'عبدالستار', 'عبدالفتاح'
        ];

        $femaleFirstNames = [
            'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'أسماء', 'سارة', 'نور',
            'ليلى', 'رحمة', 'هدى', 'سلمى', 'نادية', 'سعاد', 'أمل', 'وفاء',
            'إيمان', 'ريم', 'لينا', 'دانا', 'رنا', 'تسنيم', 'ياسمين', 'شيماء'
        ];

        $lastNames = [
            'الأحمد', 'المحمد', 'العلي', 'الخالد', 'الصالح', 'الناصر', 'السعيد',
            'الطاهر', 'الزين', 'الحسن', 'المحمود', 'الإبراهيم', 'العباس', 'الحسين',
            'الجعفر', 'المنصور', 'الهادي', 'الراشد', 'الوهاب', 'الكريم', 'الرحمن',
            'العزيز', 'الملك', 'الفتاح', 'الستار', 'الرزاق', 'الغني', 'الهادي'
        ];

        $isMale = fake()->boolean(60); // 60% male, 40% female
        $firstName = $isMale
            ? fake()->randomElement($maleFirstNames)
            : fake()->randomElement($femaleFirstNames);
        $lastName = fake()->randomElement($lastNames);

        return $firstName . ' ' . $lastName;
    }

    /**
     * Get a random Yemeni Arabic male name only
     */
    public static function yemeniMaleName(): string
    {
        $maleFirstNames = [
            'أحمد', 'محمد', 'علي', 'عبدالله', 'يوسف', 'خالد', 'عمر', 'حسن',
            'محمود', 'إبراهيم', 'عبدالرحمن', 'عبدالعزيز', 'سعيد', 'طارق', 'ناصر',
            'فهد', 'صالح', 'عبدالوهاب', 'عبدالسلام', 'عبدالكريم', 'عبدالرزاق',
            'عبدالغني', 'عبدالملك', 'عبدالهادي', 'عبدالخالق', 'عبدالستار', 'عبدالفتاح'
        ];

        $lastNames = [
            'الأحمد', 'المحمد', 'العلي', 'الخالد', 'الصالح', 'الناصر', 'السعيد',
            'الطاهر', 'الزين', 'الحسن', 'المحمود', 'الإبراهيم', 'العباس', 'الحسين',
            'الجعفر', 'المنصور', 'الهادي', 'الراشد', 'الوهاب', 'الكريم', 'الرحمن',
            'العزيز', 'الملك', 'الفتاح', 'الستار', 'الرزاق', 'الغني', 'الهادي'
        ];

        $firstName = fake()->randomElement($maleFirstNames);
        $lastName = fake()->randomElement($lastNames);

        return $firstName . ' ' . $lastName;
    }

    /**
     * Get Yemeni university departments (Arabic)
     */
    public static function yemeniDepartment(): string
    {
        $departments = [
            'علوم الحاسوب',
            'نظم المعلومات',
            'هندسة البرمجيات',
            'الأمن السيبراني',
            'الشبكات',
            'قواعد البيانات',
            'الذكاء الاصطناعي',
            'هندسة الحاسوب'
        ];

        return fake()->randomElement($departments);
    }

    /**
     * Get Yemeni university departments (English for compatibility)
     */
    public static function yemeniDepartmentEnglish(): string
    {
        $departments = [
            'Computer Science',
            'Information Systems',
            'Software Engineering',
            'Cybersecurity',
            'Networks',
            'Database Systems',
            'Artificial Intelligence',
            'Computer Engineering'
        ];

        return fake()->randomElement($departments);
    }

    /**
     * Get Yemeni academic levels (Arabic)
     */
    public static function yemeniAcademicLevel(): string
    {
        $levels = [
            'السنة الأولى',
            'السنة الثانية',
            'السنة الثالثة',
            'السنة الرابعة',
            'السنة الخامسة'
        ];

        return fake()->randomElement($levels);
    }

    /**
     * Get Yemeni academic levels (English for compatibility)
     */
    public static function yemeniAcademicLevelEnglish(): string
    {
        $levels = [
            'First Year',
            'Second Year',
            'Third Year',
            'Fourth Year',
            'Fifth Year'
        ];

        return fake()->randomElement($levels);
    }

    /**
     * Get Yemeni project specializations (Arabic)
     */
    public static function yemeniProjectSpecialization(): string
    {
        $specializations = [
            'تطوير الويب',
            'تطوير تطبيقات الهاتف',
            'الذكاء الاصطناعي والتعلم الآلي',
            'الأمن السيبراني',
            'علوم البيانات',
            'الحوسبة السحابية',
            'إنترنت الأشياء',
            'البلوك تشين',
            'الواقع الافتراضي',
            'البيانات الضخمة'
        ];

        return fake()->randomElement($specializations);
    }

    /**
     * Get Yemeni project specializations (English for compatibility)
     */
    public static function yemeniProjectSpecializationEnglish(): string
    {
        $specializations = [
            'Web Development',
            'Mobile Development',
            'AI/ML',
            'Cybersecurity',
            'Data Science',
            'Cloud Computing',
            'IoT',
            'Blockchain',
            'Virtual Reality',
            'Big Data'
        ];

        return fake()->randomElement($specializations);
    }

    /**
     * Get Yemeni project titles (Arabic)
     */
    public static function yemeniProjectTitle(): string
    {
        $titles = [
            'نظام إدارة المشاريع التخرج',
            'منصة التعليم الإلكتروني',
            'نظام إدارة المستشفيات',
            'تطبيق حجز المواعيد',
            'نظام إدارة المكتبات',
            'منصة التجارة الإلكترونية',
            'نظام إدارة الموارد البشرية',
            'تطبيق إدارة المطاعم',
            'نظام إدارة المدارس',
            'منصة العمل عن بُعد',
            'نظام إدارة المخازن',
            'تطبيق السياحة اليمنية',
            'نظام إدارة المطارات',
            'منصة الخدمات الحكومية الإلكترونية',
            'نظام إدارة المطابع',
            'تطبيق إدارة المزارع',
            'نظام إدارة الصيدليات',
            'منصة التسوق الإلكتروني',
            'نظام إدارة الفنادق',
            'تطبيق إدارة النقل'
        ];

        return fake()->randomElement($titles);
    }

    /**
     * Get Yemeni project descriptions (Arabic)
     */
    public static function yemeniProjectDescription(): string
    {
        $descriptions = [
            'مشروع يهدف إلى تطوير نظام شامل لإدارة المشاريع التخرج في الجامعات اليمنية',
            'منصة تعليمية إلكترونية متكاملة تتيح للطلاب التعلم عن بُعد',
            'نظام متقدم لإدارة العمليات في المستشفيات اليمنية',
            'تطبيق ذكي لحجز المواعيد في مختلف القطاعات',
            'نظام شامل لإدارة المكتبات الجامعية والخاصة',
            'منصة تجارة إلكترونية متخصصة في المنتجات اليمنية',
            'نظام متكامل لإدارة الموارد البشرية في المؤسسات',
            'تطبيق لإدارة المطاعم والوجبات السريعة',
            'نظام شامل لإدارة المدارس والطلاب',
            'منصة عمل عن بُعد للشركات والمؤسسات',
            'نظام متقدم لإدارة المخازن والمستودعات',
            'تطبيق سياحي يعرض المعالم السياحية اليمنية',
            'نظام شامل لإدارة عمليات المطارات',
            'منصة الخدمات الحكومية الإلكترونية للمواطنين',
            'نظام متكامل لإدارة المطابع والطباعة',
            'تطبيق لإدارة المزارع والإنتاج الزراعي',
            'نظام شامل لإدارة الصيدليات والأدوية',
            'منصة تسوق إلكتروني للمنتجات المحلية',
            'نظام متقدم لإدارة الفنادق والحجوزات',
            'تطبيق ذكي لإدارة النقل والمواصلات'
        ];

        return fake()->randomElement($descriptions);
    }

    /**
     * Get Yemeni proposal titles (Arabic)
     */
    public static function yemeniProposalTitle(): string
    {
        $titles = [
            'اقتراح نظام إدارة المشاريع التخرج',
            'اقتراح منصة التعليم الإلكتروني',
            'اقتراح نظام إدارة المستشفيات',
            'اقتراح تطبيق حجز المواعيد',
            'اقتراح نظام إدارة المكتبات',
            'اقتراح منصة التجارة الإلكترونية',
            'اقتراح نظام إدارة الموارد البشرية',
            'اقتراح تطبيق إدارة المطاعم',
            'اقتراح نظام إدارة المدارس',
            'اقتراح منصة العمل عن بُعد',
            'اقتراح نظام إدارة المخازن',
            'اقتراح تطبيق السياحة اليمنية',
            'اقتراح نظام إدارة المطارات',
            'اقتراح منصة الخدمات الحكومية',
            'اقتراح نظام إدارة المطابع',
            'اقتراح تطبيق إدارة المزارع',
            'اقتراح نظام إدارة الصيدليات',
            'اقتراح منصة التسوق الإلكتروني',
            'اقتراح نظام إدارة الفنادق',
            'اقتراح تطبيق إدارة النقل'
        ];

        return fake()->randomElement($titles);
    }

    /**
     * Get Yemeni proposal descriptions (Arabic)
     */
    public static function yemeniProposalDescription(): string
    {
        $descriptions = [
            'يهدف هذا المشروع إلى تطوير نظام شامل لإدارة المشاريع التخرج في الجامعات اليمنية، مما يساعد على تحسين عملية متابعة وتقييم المشاريع',
            'منصة تعليمية إلكترونية متكاملة تتيح للطلاب التعلم عن بُعد مع إمكانية التفاعل مع المدرسين والمواد التعليمية',
            'نظام متقدم لإدارة العمليات في المستشفيات اليمنية يشمل إدارة المواعيد والمرضى والسجلات الطبية',
            'تطبيق ذكي لحجز المواعيد في مختلف القطاعات مثل الصحة والتعليم والخدمات الحكومية',
            'نظام شامل لإدارة المكتبات الجامعية والخاصة يتضمن فهرسة الكتب وإدارة الاستعارات',
            'منصة تجارة إلكترونية متخصصة في المنتجات اليمنية المحلية لدعم الاقتصاد المحلي',
            'نظام متكامل لإدارة الموارد البشرية في المؤسسات اليمنية يشمل التوظيف والتقييم',
            'تطبيق لإدارة المطاعم والوجبات السريعة يتضمن الطلبات والحجوزات وإدارة المخزون',
            'نظام شامل لإدارة المدارس والطلاب يتضمن الحضور والغياب والدرجات',
            'منصة عمل عن بُعد للشركات والمؤسسات اليمنية لتحسين الإنتاجية',
            'نظام متقدم لإدارة المخازن والمستودعات يتضمن تتبع المخزون والطلبات',
            'تطبيق سياحي يعرض المعالم السياحية اليمنية ويساعد السياح في التخطيط لرحلاتهم',
            'نظام شامل لإدارة عمليات المطارات اليمنية يشمل الحجوزات والرحلات',
            'منصة الخدمات الحكومية الإلكترونية للمواطنين لتسهيل الحصول على الخدمات',
            'نظام متكامل لإدارة المطابع والطباعة يتضمن إدارة الطلبات والتصاميم',
            'تطبيق لإدارة المزارع والإنتاج الزراعي يساعد المزارعين في إدارة محاصيلهم',
            'نظام شامل لإدارة الصيدليات والأدوية يتضمن تتبع المخزون والوصفات',
            'منصة تسوق إلكتروني للمنتجات المحلية اليمنية لدعم التجار المحليين',
            'نظام متقدم لإدارة الفنادق والحجوزات يتضمن إدارة الغرف والخدمات',
            'تطبيق ذكي لإدارة النقل والمواصلات يساعد في تخطيط الرحلات والحجوزات'
        ];

        return fake()->randomElement($descriptions);
    }

    /**
     * Get Yemeni proposal requirements (Arabic)
     */
    public static function yemeniProposalRequirements(): string
    {
        $requirements = [
            'معرفة جيدة بلغات البرمجة الحديثة مثل PHP و JavaScript و Python',
            'خبرة في تطوير تطبيقات الويب والهاتف المحمول',
            'فهم أساسيات قواعد البيانات وأنظمة إدارة قواعد البيانات',
            'معرفة بأنظمة إدارة المشاريع وأدوات التطوير',
            'القدرة على العمل ضمن فريق والتواصل الفعال',
            'خبرة في تصميم واجهات المستخدم وتجربة المستخدم',
            'معرفة بأنظمة الأمن السيبراني وأفضل الممارسات',
            'فهم أساسيات الذكاء الاصطناعي والتعلم الآلي',
            'خبرة في تطوير واجهات برمجة التطبيقات (APIs)',
            'معرفة بأنظمة الحوسبة السحابية والبنية التحتية'
        ];

        return fake()->randomElement($requirements);
    }

    /**
     * Get Yemeni phone number
     */
    public static function yemeniPhoneNumber(): string
    {
        // Yemen phone numbers: +967 7XX XXX XXX
        $prefixes = ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'];
        $prefix = fake()->randomElement($prefixes);
        $number = fake()->numerify('#######');

        return '+967' . $prefix . $number;
    }

    /**
     * Get Yemeni email domain
     */
    public static function yemeniEmailDomain(): string
    {
        $domains = [
            'sanaauniv.edu.ye',
            'adenuniv.edu.ye',
            'taizuniv.edu.ye',
            'hodeidahuniv.edu.ye',
            'ibuniv.edu.ye',
            'gpms.local'
        ];

        return fake()->randomElement($domains);
    }

    /**
     * Get Yemeni committee name (Arabic)
     */
    public static function yemeniCommitteeName(string $type = 'project'): string
    {
        $baseNames = [
            'لجنة المشاريع',
            'لجنة التخرج',
            'لجنة التقييم',
            'لجنة المناقشة',
            'لجنة المتابعة',
            'لجنة المراجعة'
        ];

        if ($type === 'discussion') {
            $names = [
                'لجنة مناقشة المشاريع الأولى',
                'لجنة مناقشة المشاريع الثانية',
                'لجنة مناقشة المشاريع الثالثة',
                'لجنة التقييم النهائي',
                'لجنة المناقشة العلمية'
            ];
        } else {
            $names = [
                'لجنة المشاريع التخرج',
                'لجنة متابعة المشاريع',
                'لجنة تقييم المشاريع',
                'لجنة الإشراف على المشاريع',
                'لجنة التنسيق الأكاديمي'
            ];
        }

        return fake()->randomElement($names);
    }
}
