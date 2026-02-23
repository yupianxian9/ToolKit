# python环境配置

## 注意

python一定要安装**amd64位的版本**，否则后续安装第三方库极为容易报错。

安装第三方库前要安装**Microsoft Visual C++ Build Tools**

## **一、设置清华源**

```
pip与conda安装可能有冲突，建议conda仅仅在虚拟环境时使用，或者全局使用conda而不用pip
pip设置镜像
set PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple


conda设置镜像
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/
conda config --set show_channel_urls yes

conda验证配置​
conda config --show channels

```


## **二、安装各类包**

### **安装预编译的二进制文件**

可以使用 `--only-binary` 参数强制安装已编译好的 `pandas` 包：

```
pip install pandas --only-binary=:all:
```

### 1. **数据处理**

```
pip install numpy pandas scipy
pip install polars
pip install polars[plot] 
pip install polars[time]
pip install polars[all]
```

- **Numpy**：支持高效数组计算。
- **Pandas**：用于数据操作和分析。
- **Scipy**：提供科学计算的各种功能，例如线性代数、优化、统计。
- **polars**：这是一个高性能的数据帧库，尤其适合处理大规模数据和需要高效计算的场景，polars[plot] 为含可视化功能的版本，polars[time]为启用 `time-series` 相关功能的版本，polars[all]为安装所有可选功能的版本

------

### 2. **数据可视化**

```
pip install matplotlib seaborn plotly
```

- **Matplotlib**：基础的绘图库。
- **Seaborn**：基于 Matplotlib 的高级统计可视化工具。
- **Plotly**：交互式可视化，适用于动态图表和网页嵌入。

------

### 3. **机器学习**

```
pip install scikit-learn xgboost lightgbm catboost
```

- **Scikit-learn**：经典机器学习算法。
- **XGBoost**、**LightGBM**、**CatBoost**：高效的梯度提升树算法库。

------

### 4. **深度学习**

```

pip install tensorflow keras torch torchvision
```

- **TensorFlow** & **Keras**：谷歌开发的深度学习框架。
- **PyTorch**：流行的动态计算图深度学习框架。
- **Torchvision**：处理图像任务的附加库。

------

### 5. **数据抓取与处理**

```
pip install requests beautifulsoup4 lxml scrapy
```

- **Requests**：网络请求工具。
- **BeautifulSoup** & **lxml**：HTML/XML 解析库。
- **Scrapy**：高效的爬虫框架。

------

### 6. **自然语言处理（NLP）**

```
pip install nltk spacy gensim transformers
```

- **NLTK**：经典 NLP 工具。
- **SpaCy**：高效的 NLP 框架。
- **Gensim**：主题建模与文档相似性分析。
- **Transformers**：基于 BERT、GPT 等预训练模型的库。

------

### 7. **时间序列分析**

```
pip install statsmodels pmdarima prophet
```

- **Statsmodels**：统计建模。
- **PMDARIMA**：自动 ARIMA 模型选择。
- **Prophet**：Facebook 开发的时间序列预测工具。

------

### 8. **数据库操作**

```
pip install sqlalchemy psycopg2 pymysql
```

- **SQLAlchemy**：数据库 ORM 工具。
- **psycopg2**：PostgreSQL 驱动。
- **PyMySQL**：MySQL 驱动。

------

### 9. **辅助工具**

```
pip install tqdm
pip install joblib 
pip install jupyterlab
pip install notebook
```

- **Tqdm**：显示循环进度条。
- **Joblib**：并行计算工具。
- **JupyterLab**：交互式编程环境。

***

### 10.大模型

```
pip install python-dotenv openai dashscope
pip install langchain langchain-community langchain-core langchain-openai langchain-text-splitters transformers

```

***

### 11.pdf处理库

```
# 提取库
pip install pdfminer.six pdfplumber

# pdf的压缩，加密等处理
pip install pymupdf
```



------

安装完成后，定期检查更新：

```
pip list --outdated
pip install --upgrade 包名
```


## 三、Python虚拟环境管理工具推荐

* pipenv

* pycharm
