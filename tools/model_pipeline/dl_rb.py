import re, subprocess, urllib.request, os, concurrent.futures as cf
AV={'Adults':['Male_Adult_02','Male_Adult_03','Male_Adult_05','Male_Adult_06','Male_Adult_08','Male_Adult_13','Male_Adult_16','Male_Adult_20',
              'Female_Adult_01','Female_Adult_02','Female_Adult_04','Female_Adult_07','Female_Adult_13','Female_Adult_17'],
    'Professions':['Gardener_Male_01','Delivery_Male_01','Police_Male_01','Fire_Male_01','Medical_Male_01','Chef_Female_01']}
RAW='https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/'
def listing(path):
    h=urllib.request.urlopen('https://github.com/microsoft/Microsoft-Rocketbox/tree/HEAD/'+path).read().decode('utf-8','ignore')
    it=re.findall(r'"name":"([^"]+)","path":"([^"]+)","contentType":"(file|directory)"',h)
    return sorted(set(p for n,p,t in it if p.startswith(path+'/') and t=='file'))
jobs=[]
for grp,names in AV.items():
    for n in names:
        base=f'Assets/Avatars/{grp}/{n}'
        os.makedirs(f'rb/{n}',exist_ok=True)
        jobs.append((RAW+f'{base}/Export/{n}.fbx', f'rb/{n}/{n}.fbx'))
        for p in listing(base+'/Textures'):
            jobs.append((RAW+p, f'rb/{n}/'+p.split('/')[-1]))
A='Assets/Animations/'
anims={'all_animations_max_motextr_xy':['m_walk_neutral_01','m_run_neutral_01','m_walk_stroll_01','m_walk_drunk','f_walk_neutral_01','f_run_neutral_01','f_walk_stroll_01'],
       'all_animations_max_motextr_static':['m_idle_neutral_01','m_idle_look_around_01','m_sit_chair_idle_neutral_01','m_sit_table_idle_neutral_01','m_drink_drinking','m_wave_01','m_gestic_talk_neutral_01','m_cell_phone_talk_01','m_dancing_neutral','m_idle_drunk_01',
            'f_idle_neutral_01','f_idle_look_around_01','f_sit_chair_idle_neutral_01','f_sit_table_idle_neutral_01','f_drink_drinking','f_wave_01','f_gestic_talk_neutral_01','f_dancing_neutral']}
for d,ls in anims.items():
    for a in ls: jobs.append((RAW+A+d+'/'+a+'.max.fbx','rb_anim/'+a+'.fbx'))
def get(j):
    u,o=j
    try:
        urllib.request.urlretrieve(u.replace(' ','%20'),o); return (o,os.path.getsize(o))
    except Exception as e: return (o,'ERR '+str(e))
with cf.ThreadPoolExecutor(8) as ex:
    res=list(ex.map(get,jobs))
bad=[r for r in res if not isinstance(r[1],int) or r[1]<1000]
print('files',len(res),'bad',bad[:10])
tot=sum(r[1] for r in res if isinstance(r[1],int)); print('MB',round(tot/1e6,1))
