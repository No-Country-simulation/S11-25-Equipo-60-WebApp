# app/migrations/0002_add_feedback.py

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'), # Asegúrate de que este es el nombre de tu migración inicial
    ]

    operations = [
        migrations.AddField(
            model_name='testimonios',
            name='feedback',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
    ]