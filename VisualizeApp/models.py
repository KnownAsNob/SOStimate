from django.db import models
from django.contrib.postgres.fields import JSONField


class Station(models.Model):
    name = models.CharField(max_length=50)
    info = JSONField()

class Calls(models.Model):
    details = JSONField()

    class Meta: 
        managed = False 
        db_table = 'VisualizeApp_calls'