#!/usr/bin/env python3
"""Validate the standalone website without third-party dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import argparse,json,xml.etree.ElementTree as ET

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.lang=None;self.ids=[];self.links=[];self.assets=[];self.canonical=[];self.alternates={};self.h1=0;self.titles=0;self.desc=[];self.schemas=[];self.in_schema=False;self.schema=''
        self.feed(text)
    def handle_starttag(self,tag,attributes):
        a=dict(attributes)
        if tag=='html':self.lang=a.get('lang')
        if a.get('id'):self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
        if tag=='title':self.titles+=1
        if tag=='meta' and a.get('name')=='description':self.desc.append(a.get('content'))
        if tag=='a' and a.get('href'):self.links.append(a['href'])
        if tag in ('img','script') and a.get('src'):self.assets.append(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet':self.assets.append(a['href'])
        if tag=='img' and a.get('srcset'):
            self.assets.extend(x.strip().split()[0] for x in a['srcset'].split(','))
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
        if tag=='link' and a.get('rel')=='alternate':self.alternates[a['hreflang']]=a['href']
        if tag=='script' and a.get('type')=='application/ld+json':self.in_schema=True;self.schema=''
    def handle_data(self,data):
        if self.in_schema:self.schema+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.in_schema:
            self.schemas.append(json.loads(self.schema));self.in_schema=False

def validate(root,base=None):
    root=Path(root).resolve();pages={p.name:Page(p.read_text(encoding='utf-8')) for p in root.glob('*.html')}
    assert len(pages)==20,f'Expected 20 pages, found {len(pages)}'
    errors=[]
    def require(ok,msg):
        if not ok:errors.append(msg)
    def resolve(url,current):
        u=urlsplit(url)
        if u.scheme or u.netloc:
            if not base or not url.startswith(base.rstrip('/')+'/'):return None
            rel=url[len(base.rstrip('/')+'/'):].split('#')[0].split('?')[0]
        else:rel=u.path or current
        rel=unquote(rel);candidate=(root/rel.lstrip('/')).resolve()
        if candidate==root:candidate=root/'index.html'
        if not candidate.is_relative_to(root):return None
        return candidate,u.fragment
    for name,page in pages.items():
        require(page.h1==1,f'{name}: one H1 required');require(page.titles==1,f'{name}: one title required')
        require(len(page.desc)==1 and bool(page.desc[0]),f'{name}: description missing')
        require(len(page.ids)==len(set(page.ids)),f'{name}: duplicate IDs')
        require(len(page.canonical)==1,f'{name}: canonical missing')
        require(set(page.alternates)=={'bg','en','x-default'},f'{name}: language links incomplete')
        require(bool(page.schemas),f'{name}: structured data missing')
        if base:
            expected=base.rstrip('/')+('/' if name=='index.html' else '/'+name)
            require(page.canonical==[expected],f'{name}: wrong canonical {page.canonical}')
        for link in page.links+page.assets+list(page.alternates.values()):
            result=resolve(link,name)
            if result is None:continue
            target,fragment=result
            require(target.is_file(),f'{name}: missing target {link}')
            if fragment and target.name in pages:
                require(fragment in pages[target.name].ids,f'{name}: missing fragment {link}')
        if base:
            for code,target_url in page.alternates.items():
                result=resolve(target_url,name)
                require(result is not None,f'{name}: language link outside site')
                if result is not None:
                    target,_=result
                    if target.name in pages:
                        require(pages[target.name].alternates.get(page.lang)==page.canonical[0],f'{name}: language links not reciprocal')
    tree=ET.parse(root/'sitemap.xml');locs=[e.text for e in tree.getroot().iter() if e.tag.endswith('}loc')]
    require(len(locs)==20 and len(set(locs))==20,'Sitemap must contain 20 unique URLs')
    if base:
        require(set(locs)=={p.canonical[0] for p in pages.values()},'Sitemap and canonical URLs differ')
        require('Sitemap: '+base.rstrip('/')+'/sitemap.xml' in (root/'robots.txt').read_text(),'robots.txt sitemap URL differs')
    if errors:raise ValueError('\n'.join(errors))
    print(f'PASS: {len(pages)} HTML pages, assets, links, metadata, structured data, language variants and sitemap.')
    return len(pages)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--root',default=str(Path(__file__).resolve().parents[1]));parser.add_argument('--base-url');args=parser.parse_args()
    try:validate(args.root,args.base_url)
    except (AssertionError,ValueError,KeyError) as e:parser.exit(1,str(e)+'\n')
