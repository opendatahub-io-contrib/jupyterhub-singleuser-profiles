import os
import sys
from setuptools import setup
from setuptools.command.test import test as TestCommand
from setuptools.command.install import install

def copy_dir():
    dir_path = 'ui'
    base_dir = os.path.join('', dir_path)
    for (dirpath, dirnames, files) in os.walk(base_dir):
        for f in files:
            yield os.path.join(dirpath.split('/', 1)[1], f)

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

class Test(TestCommand):
    user_options = [
        ('pytest-args=', 'a', "Arguments to pass into py.test")
    ]

    def initialize_options(self):
        super().initialize_options()
        self.pytest_args = ['--timeout=2', '--cov=./thoth', '--capture=no', '--verbose']

    def finalize_options(self):
        super().finalize_options()
        self.test_args = []
        self.test_suite = True

    def run_tests(self):
        import pytest
        sys.exit(pytest.main(self.pytest_args))


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
        'api',
        'ui',
    ],
    package_data= {
        '': ['*.yaml', '*.json', '*.css', '*.txt', '*.html', '*.js'] + [f for f in copy_dir()],
    },
    zip_safe=False,
    install_requires=get_install_requires(),
    tests_require=get_test_requires(),
    cmdclass={'test': Test},
)