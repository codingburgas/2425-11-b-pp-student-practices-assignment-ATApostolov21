from setuptools import setup, find_packages

setup(
    name="banktools_ai",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "numpy",
        "pandas",
        "matplotlib",
        "joblib",
    ],
    author="ATApostolov21",
    description="BankTools AI - Intelligent Banking Solutions",
    python_requires=">=3.7",
) 