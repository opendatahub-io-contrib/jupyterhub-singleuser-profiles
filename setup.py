import os
import sys
from setuptools import setup
from setuptools.command.test import test as TestCommand
from setuptools.command.install import install
import distutils.log

def copy_dir():
    dir_path = 'jupyterhub_singleuser_profiles_ui'
    base_dir = os.path.join('', dir_path)
    for (dirpath, dirnames, files) in os.walk(base_dir):
        for f in files:
            try:
                yield os.path.join(dirpath.split('/', 1)[1], f)
            except Exception:
                print(dirpath, f)

def get_install_requires():
    with open('requirements.txt', 'r') as requirements_file:
        # TODO: respect hashes in requirements.txt file
        res = requirements_file.readlines()
        return [req.split(' ', maxsplit=1)[0] for req in res if req]


def get_test_requires():
  if os.path.exists('requirements-test.txt'):
    with open('requirements-test.txt', 'r') as requirements_file:
        res = requirements_file.readlines()
        return [req.split(' ', maxsplit=1)[0] for req in res if req]
  else:
    return []

setup(
    name='jupyterhub-singleuser-profiles',
    version="0.0.1",
    description='A tool to parse yaml configuration files used in singleuser JupyterHub servers',
    long_description='A tool to parse yaml configuration files used in singleuser JupyterHub servers',
    author='Vaclav Pavlin',
    author_email='vasek@redhat.com',
    license='GPLv3+',
    packages=[
        'jupyterhub_singleuser_profiles',
        'jupyterhub_singleuser_profiles_api',
        'jupyterhub_singleuser_profiles_ui',
    ],
    package_data= {
        '': [f for f in copy_dir()] + ['*.json', '*.yaml', '*.txt']
    },
    zip_safe=False,
    install_requires=get_install_requires(),
    tests_require=get_test_requires(),
)