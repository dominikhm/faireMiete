#!/usr/bin/env python
# coding: utf-8

# In[20]:


import pandas as pd
import numpy as np


# In[36]:


df = pd.read_json (r'data.json')


# In[28]:


adr=df.iloc[0,1].split(',')
adr1=adr[0]
hausnr=[int(s) for s in adr1.split() if s.isdigit()]
strasse=''.join([i for i in adr1 if not i.isdigit()])
plz=adr[1]
plz=[int(s) for s in plz.split() if s.isdigit()]


# In[38]:


df = pd.DataFrame.from_records(df.iloc[:,0])
df


# In[42]:


alt = float(df.iloc[1,2].replace(',','.'))
neu = float(df.iloc[0,2].replace(',','.'))
alt, neu


# In[46]:


df1 = pd.DataFrame({'PLZ' : plz, 'Strasse' : strasse, 'Hausnummer' : hausnr, 'Zuschlag_bis_0319' : alt,'Zuschlag_seit_0419' : neu, 'Differenz' : round(neu - alt, 2)})
df1


# In[47]:


df1.to_csv('zuschlag.csv', index=False)


# In[ ]:
