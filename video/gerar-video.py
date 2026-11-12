import subprocess, os, textwrap
from PIL import Image, ImageDraw, ImageFont
R="/home/user/devops-atividade-final/docs/prints/"
W,H=1280,720
B=lambda s:ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",s)
N=lambda s:ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",s)
BG=(15,23,42); AC=(56,189,248)
scenes=[
("Atividade Final de DevOps","API de Tarefas · CI/CD · Kubernetes · ELK\n\nAlan Leão e Lucas — UNAMA, Ciência da Computação",[],
 "Olá! Neste vídeo apresentamos a atividade final de DevOps. Construímos uma API em Node ponto jota és, com pipeline de integração e entrega contínua no GitHub Actions, implantação em Kubernetes com Helm, e monitoramento de logs com a stack E L K."),
("Visão geral da solução","Código → GitHub Actions → Imagem Docker (ghcr.io) → Helm → Kubernetes\nLogs → Filebeat → Elasticsearch → Kibana",[],
 "O fluxo é simples. O desenvolvedor envia o código ao GitHub. O pipeline roda os testes, constrói a imagem Docker e publica no registro de contêineres. Em seguida, o Helm implanta a aplicação no Kubernetes. Em paralelo, os logs seguem pelo Filebeat até o Elasticsearch, e são visualizados no Kibana."),
("Etapa 2 · Integração contínua","A cada push: instala dependências, roda 5 testes unitários\ne só então constrói a imagem Docker.",["02-ci-testes.jpg","01-pipeline-sucesso.jpg"],
 "Na etapa dois, o pipeline executa a cada push. Primeiro roda os cinco testes unitários da API. Só se todos passarem, o pipeline constrói a imagem Docker. À direita, vemos a execução completa com sucesso, com os jobs de C I e de deploy em verde."),
("Registro de imagens","A imagem é publicada automaticamente no\nGitHub Container Registry, versionada pelo commit.",["05-imagem-ghcr.jpg"],
 "A imagem gerada é publicada automaticamente no GitHub Container Registry, com a tag ligada ao commit. Assim, cada versão da aplicação fica rastreável e pode ser reimplantada a qualquer momento."),
("Etapa 3 · Kubernetes com Helm","helm upgrade --install no cluster Kind\nDeployment + Service NodePort + Ingress",["03-deploy-helm.jpg","04-kubernetes-pods-svc.jpg"],
 "Na etapa três, o deploy é feito com um chart Helm. O pipeline sobe um cluster Kind temporário e executa o comando helm upgrade install. À direita, o kubectl mostra os pods em execução e o serviço do tipo NodePort expondo a API."),
("Etapa 4 · Logs com ELK","Elasticsearch + Kibana + Filebeat\nDashboard: logs, códigos de status e latência",["06-kibana-dashboard.png"],
 "Na etapa quatro, o Filebeat coleta os logs dos contêineres e os envia ao Elasticsearch. No Kibana montamos um painel com o volume de logs, a distribuição dos códigos de status HTTP e a latência das requisições, o que permite observar a saúde da aplicação em tempo real."),
("Conclusão","Automação ponta a ponta: commit → teste → build → deploy → observabilidade\n\nCódigo: github.com/leao-leao/devops-atividade-final",[],
 "Concluindo, entregamos um ciclo completo de DevOps: do commit à observabilidade, tudo automatizado. O código e o relatório estão no repositório leao-leao barra devops-atividade-final, no GitHub. Obrigado!"),
]
def frame(i,t,sub,imgs):
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    d.rectangle([0,0,14,H],fill=AC)
    d.text((70,50),t,font=B(46 if not imgs else 38),fill="white")
    if not imgs:
        y=250
        for l in sub.split("\n"):
            d.text((70,y),l,font=N(30),fill=(203,213,225)); y+=48
    else:
        y=120
        for l in sub.split("\n"):
            d.text((70,y),l,font=N(24),fill=(203,213,225)); y+=38
        x=70; maxh=H-250
        ims=[Image.open(R+f).convert("RGB") for f in imgs]
        if len(ims)==1 and ims[0].size[0]>ims[0].size[1]:
            ims[0].thumbnail((W-140,H-230)); im.paste(ims[0],(70,200))
        else:
            xo=W//2 if False else 70
            for p in ims:
                p.thumbnail((600,H-230)); im.paste(p,(xo,200)); xo+=p.size[0]+40
            # side note on the right for single portrait
    d.text((W-300,H-40),f"{i}/{len(scenes)}",font=N(20),fill=(100,116,139))
    return im
# srt + segments
segs=[];srt=[];t0=0.0
def ts(s):
    h=int(s//3600);m=int(s%3600//60);x=s%60
    return f"{h:02}:{m:02}:{int(x):02},{int((x%1)*1000):03}"
for i,(t,sub,imgs,nar) in enumerate(scenes,1):
    frame(i,t,sub,imgs).save(f"/tmp/v/s{i}.png")
    subprocess.run(["espeak-ng","-v","pt-br","-s","150","-w",f"/tmp/v/a{i}.wav",nar],check=True)
    dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"/tmp/v/a{i}.wav"]))+1.0
    subprocess.run(["ffmpeg","-y","-loglevel","error","-loop","1","-i",f"/tmp/v/s{i}.png","-i",f"/tmp/v/a{i}.wav","-af","apad=pad_dur=1","-t",f"{dur}","-c:v","libx264","-pix_fmt","yuv420p","-r","25","-c:a","aac",f"/tmp/v/seg{i}.mp4"],check=True)
    segs.append(f"file 'seg{i}.mp4'")
    srt.append(f"{i}\n{ts(t0)} --> {ts(t0+dur-0.5)}\n{textwrap.fill(nar,60)}\n")
    t0+=dur
open("/tmp/v/list.txt","w").write("\n".join(segs))
open("/tmp/v/legendas.srt","w").write("\n".join(srt))
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-i","/tmp/v/list.txt","-c","copy","/tmp/v/video.mp4"],check=True)
print("total",t0)
