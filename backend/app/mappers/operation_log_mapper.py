# -*- coding: utf-8 -*-
"""
操作日志数据映射层
"""
from app.config import Config
from app.mappers.excel_storage import ExcelStorage
from app.entity.operation_log import OperationLog


class OperationLogMapper:
    """操作日志数据映射器"""
    
    COLUMNS = ['id', 'user_id', 'username', 'action', 'target_type', 'target_id', 'details', 'created_at']
    
    def __init__(self):
        self.storage = ExcelStorage(Config.LOGS_FILE, self.COLUMNS)
    
    def find_all(self):
        """获取所有日志"""
        data = self.storage.read_all()
        return [OperationLog.from_dict(item) for item in data]
    
    def find_by_id(self, id):
        """根据 ID 查找日志"""
        data = self.storage.find_by_id(id)
        return OperationLog.from_dict(data) if data else None
    
    def find_by_user_id(self, user_id):
        """根据用户 ID 查找日志"""
        results = self.storage.find_by_field('user_id', user_id)
        return [OperationLog.from_dict(item) for item in results]
    
    def find_by_target(self, target_type, target_id):
        """根据目标查找日志"""
        all_data = self.storage.read_all()
        results = []
        for item in all_data:
            if item.get('target_type') == target_type and str(item.get('target_id')) == str(target_id):
                results.append(OperationLog.from_dict(item))
        return results
    
    def insert(self, log):
        """插入日志记录"""
        if isinstance(log, OperationLog):
            data = log.to_dict()
        else:
            data = log
        self.storage.insert(data)
        return data
    
    def count(self):
        """获取日志总数"""
        return self.storage.count()


# 单例实例
operation_log_mapper = OperationLogMapper()
