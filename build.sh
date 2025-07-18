#!/usr/bin/env bash
# build.sh

set -o errexit

echo "=== Starting Booking Vision build ==="

# Upgrade pip and setuptools first
pip install --upgrade pip setuptools wheel

# Install dependencies
pip install -r requirements.txt

# Create directories if they don't exist
mkdir -p staticfiles
mkdir -p media

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser automatically
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='ZZ_Corp').exists():
    user = User.objects.create_superuser(
        username='ZZ_Corp',
        email='zzcorp@sauronvision.com',
        password='Elpatron24!'
    )
    user.user_id = 'ZZ_Corp'
    user.save()
    print('Superuser created!')
else:
    print('Superuser already exists!')
EOF

echo "=== Build completed successfully! ==="