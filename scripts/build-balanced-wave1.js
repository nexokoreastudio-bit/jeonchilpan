const fs=require('fs')
const p='docs/resource-migration/resource_triage_immediate_v1.csv'
const lines=fs.readFileSync(p,'utf8').trim().split(/\r?\n/)
const h=lines[0]
function parse(line){
  const out=[]; let cur=''; let q=false
  for(let i=0;i<line.length;i++){
    const ch=line[i]
    if(q){
      if(ch==='"'){ if(line[i+1]==='"'){cur+='"';i++} else q=false }
      else cur+=ch
    } else {
      if(ch==='"') q=true
      else if(ch===','){ out.push(cur); cur='' }
      else cur+=ch
    }
  }
  out.push(cur)
  return out
}
function esc(s){s=String(s??''); return (s.includes(',')||s.includes('"')||s.includes('\n'))?`"${s.replace(/"/g,'""')}"`:s}
const rows=lines.slice(1).map(parse)
const idx={stage:0,reason:1,title:2,cat:3,type:4,size:5,pri:6,path:7}
const byCat={}
for(const r of rows){
  const c=r[idx.cat]||'기타'
  ;(byCat[c]??=[]).push(r)
}
for(const c of Object.keys(byCat)){
  byCat[c].sort((a,b)=>Number(a[idx.size])-Number(b[idx.size]))
}
const quotas={
  '입시_진학':15,
  '정책_공문':12,
  '상담_학부모':10,
  '수업_교재':8,
  '데이터_분석':3,
  '학원운영':2,
}
const picked=[]
for(const [cat,q] of Object.entries(quotas)){
  const arr=byCat[cat]||[]
  for(let i=0;i<Math.min(q,arr.length);i++) picked.push(arr[i])
}
if(picked.length<50){
  const used=new Set(picked.map(r=>r[idx.path]))
  const rem=rows.filter(r=>!used.has(r[idx.path])).sort((a,b)=>Number(a[idx.size])-Number(b[idx.size]))
  for(let i=0; i<rem.length && picked.length<50; i++) picked.push(rem[i])
}
const out=['wave,title,category_hint,file_type,size_mb,candidate_path']
for(const r of picked.slice(0,50)){
  out.push(['wave1_balanced',r[idx.title],r[idx.cat],r[idx.type],Number(r[idx.size]).toFixed(2),r[idx.path]].map(esc).join(','))
}
fs.writeFileSync('docs/resource-migration/resource_rollout_wave1_top50_balanced_v1.csv',out.join('\n')+'\n')
const cnt={}
for(const r of picked.slice(0,50)){cnt[r[idx.cat]]=(cnt[r[idx.cat]]||0)+1}
console.log(cnt)
