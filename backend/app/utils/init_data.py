# -*- coding: utf-8 -*-
"""
数据初始化模块 - 确保首次运行时 Excel 文件正确创建并填充示例数据
"""
import os
from app.config import Config
from app.utils.logger import get_logger

logger = get_logger(__name__)


def init_data_directory():
    """初始化数据目录"""
    data_dir = Config.DATA_DIR
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
        logger.info(f'Created data directory: {data_dir}')


def init_sample_students():
    """初始化示例学生数据"""
    from app.mappers.student_mapper import student_mapper
    from app.entity.student import Student
    
    # 如果已有学生数据则跳过
    if student_mapper.count() > 0:
        logger.info('Student data already exists, skipping sample data initialization')
        return
    
    # 示例学生数据
    sample_students = [
        {'student_id': '2024001', 'name': '张三', 'gender': 'male', 'class_name': '计算机1班', 
         'chinese_score': 85, 'math_score': 92, 'english_score': 78},
        {'student_id': '2024002', 'name': '李四', 'gender': 'male', 'class_name': '计算机1班', 
         'chinese_score': 78, 'math_score': 88, 'english_score': 82},
        {'student_id': '2024003', 'name': '王五', 'gender': 'female', 'class_name': '计算机1班', 
         'chinese_score': 92, 'math_score': 85, 'english_score': 90},
        {'student_id': '2024004', 'name': '赵六', 'gender': 'male', 'class_name': '计算机2班', 
         'chinese_score': 70, 'math_score': 75, 'english_score': 68},
        {'student_id': '2024005', 'name': '钱七', 'gender': 'female', 'class_name': '计算机2班', 
         'chinese_score': 88, 'math_score': 95, 'english_score': 91},
        {'student_id': '2024006', 'name': '孙八', 'gender': 'male', 'class_name': '计算机2班', 
         'chinese_score': 65, 'math_score': 70, 'english_score': 72},
        {'student_id': '2024007', 'name': '周九', 'gender': 'female', 'class_name': '软件1班', 
         'chinese_score': 95, 'math_score': 98, 'english_score': 96},
        {'student_id': '2024008', 'name': '吴十', 'gender': 'male', 'class_name': '软件1班', 
         'chinese_score': 82, 'math_score': 79, 'english_score': 85},
        {'student_id': '2024009', 'name': '郑十一', 'gender': 'female', 'class_name': '软件1班', 
         'chinese_score': 76, 'math_score': 82, 'english_score': 80},
        {'student_id': '2024010', 'name': '王十二', 'gender': 'male', 'class_name': '软件2班', 
         'chinese_score': 90, 'math_score': 88, 'english_score': 92},
    ]
    
    for data in sample_students:
        student = Student(
            student_id=data['student_id'],
            name=data['name'],
            gender=data['gender'],
            class_name=data['class_name'],
            chinese_score=data['chinese_score'],
            math_score=data['math_score'],
            english_score=data['english_score']
        )
        student_mapper.insert(student)
    
    logger.info(f'Initialized {len(sample_students)} sample students')


def init_excel_files():
    """初始化 Excel 数据文件"""
    # 导入 mapper 会自动触发文件创建和默认用户初始化
    from app.mappers.user_mapper import user_mapper
    from app.mappers.student_mapper import student_mapper
    from app.mappers.operation_log_mapper import operation_log_mapper
    from app.mappers.class_mapper import class_mapper
    from app.mappers.grade_mapper import grade_mapper
    
    logger.info('Excel files initialized successfully')
    
    # 输出文件状态
    files = [
        ('用户数据', Config.USERS_FILE),
        ('学生数据', Config.STUDENTS_FILE),
        ('操作日志', Config.LOGS_FILE),
        ('班级数据', Config.CLASSES_FILE),
        ('成绩数据', Config.GRADES_FILE)
    ]
    
    for name, path in files:
        exists = os.path.exists(path)
        status = '已存在' if exists else '创建失败'
        logger.info(f'{name}: {path} - {status}')


def init_sample_classes():
    """初始化示例班级数据"""
    from app.mappers.class_mapper import class_mapper
    from app.entity.class_info import ClassInfo
    
    # 如果已有班级数据则跳过
    if class_mapper.count() > 0:
        logger.info('Class data already exists, skipping sample data initialization')
        return
    
    # 从现有学生数据中提取班级
    from app.mappers.student_mapper import student_mapper
    students = student_mapper.find_all()
    class_names = set(s.class_name for s in students if s.class_name)
    
    # 如果没有学生数据，创建默认班级
    if not class_names:
        class_names = {'计算机1班', '计算机2班', '软件1班', '软件2班'}
    
    for name in class_names:
        class_info = ClassInfo(name=name)
        class_mapper.insert(class_info)
    
    logger.info(f'Initialized {len(class_names)} classes')


def init_sample_grades():
    """初始化示例成绩数据"""
    from app.mappers.grade_mapper import grade_mapper
    from app.entity.grade import Grade
    
    # 如果已有成绩数据则跳过
    if grade_mapper.count() > 0:
        logger.info('Grade data already exists, skipping sample data initialization')
        return
    
    # 示例成绩数据
    sample_grades = [
        {'student_id': '2024001', 'name': '张三', 'course_name': '高等数学', 'score': 85, 'exam_time': '2024-06-15'},
        {'student_id': '2024001', 'name': '张三', 'course_name': '大学英语', 'score': 78, 'exam_time': '2024-06-16'},
        {'student_id': '2024001', 'name': '张三', 'course_name': '计算机基础', 'score': 92, 'exam_time': '2024-06-17'},
        {'student_id': '2024002', 'name': '李四', 'course_name': '高等数学', 'score': 78, 'exam_time': '2024-06-15'},
        {'student_id': '2024002', 'name': '李四', 'course_name': '大学英语', 'score': 82, 'exam_time': '2024-06-16'},
        {'student_id': '2024002', 'name': '李四', 'course_name': '计算机基础', 'score': 88, 'exam_time': '2024-06-17'},
        {'student_id': '2024003', 'name': '王五', 'course_name': '高等数学', 'score': 92, 'exam_time': '2024-06-15'},
        {'student_id': '2024003', 'name': '王五', 'course_name': '大学英语', 'score': 90, 'exam_time': '2024-06-16'},
        {'student_id': '2024003', 'name': '王五', 'course_name': '计算机基础', 'score': 85, 'exam_time': '2024-06-17'},
        {'student_id': '2024004', 'name': '赵六', 'course_name': '高等数学', 'score': 70, 'exam_time': '2024-06-15'},
        {'student_id': '2024004', 'name': '赵六', 'course_name': '大学英语', 'score': 68, 'exam_time': '2024-06-16'},
        {'student_id': '2024004', 'name': '赵六', 'course_name': '计算机基础', 'score': 75, 'exam_time': '2024-06-17'},
    ]
    
    for data in sample_grades:
        grade = Grade(
            student_id=data['student_id'],
            name=data['name'],
            course_name=data['course_name'],
            score=data['score'],
            exam_time=data['exam_time']
        )
        grade_mapper.insert(grade)
    
    logger.info(f'Initialized {len(sample_grades)} sample grades')


def init_all():
    """初始化所有数据"""
    logger.info('Starting data initialization...')
    init_data_directory()
    init_excel_files()
    init_sample_students()
    init_sample_classes()
    init_sample_grades()
    logger.info('Data initialization completed')
