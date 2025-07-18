#!/usr/bin/env bash
# build.sh

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser automatically
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='ZZ_Corp').exists():
    User.objects.create_superuser(
        username='ZZ_Corp',
        user_id='ZZ_Corp',
        email='zzcorp@sauronvision.com',
        password='Elpatron24!'
    )
    print('Superuser created!')
EOF