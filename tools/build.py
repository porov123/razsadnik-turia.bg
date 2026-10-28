#!/usr/bin/env python3
"""Prepare hosting files and all absolute SEO addresses for an actual public URL."""
from pathlib import Path
from urllib.parse import urlsplit
import argparse,json,shutil,tempfile,sys
from check import validate
ROOT=Path(__file__).resolve().parents[1]

def public_url(value):
    value=value.strip().rstrip('/');u=urlsplit(value)
    if u.scheme!='https' or not u.hostname or u.username or u.password or u.query or u.fragment or any(c.isspace() or c in '<>"\'' for c in value) or '..' in u.path.split('/'):
        raise ValueError('Use the real HTTPS address, without username, password, query or fragment.')
    return value

def build(target,output):
    target=public_url(target);output=Path(output).resolve()
    protected=[ROOT,ROOT/'tools',ROOT/'assets']
    if output in protected or any(p.is_relative_to(output) for p in protected):raise ValueError('Output must be a separate generated folder.')
    if output.exists() and any(output.iterdir()) and not (output/'.nursery-build.json').is_file():raise ValueError('Output is not empty or not a generated build. Choose a new output folder.')
    config=json.loads((ROOT/'site-config.json').read_text());source=config['source_url'].rstrip('/')
    files=json.loads((ROOT/'website-files.json').read_text());output.parent.mkdir(parents=True,exist_ok=True)
    temporary=Path(tempfile.mkdtemp(prefix='nursery-build-',dir=output.parent))
    try:
        for name in files:
            path=(ROOT/name).resolve()
            if not path.is_relative_to(ROOT) or not path.is_file():raise ValueError('Invalid website manifest entry: '+name)
            dest=temporary/name;dest.parent.mkdir(parents=True,exist_ok=True)
            if path.suffix.lower() in ['.html','.xml','.txt','.js','.css','.svg']:
                text=path.read_text(encoding='utf-8').replace(source,target)
                if path.suffix=='.html':text=text.replace('href="/?lang=bg"','href="index.html?lang=bg"')
                dest.write_text(text,encoding='utf-8')
            else:shutil.copyfile(path,dest)
        validate(temporary,target)
        for p in temporary.rglob('*'):
            if p.is_file() and p.suffix in ['.html','.xml','.txt'] and source!=target:
                if source in p.read_text():raise ValueError('Old hosting address remains in '+str(p))
        (temporary/'.nursery-build.json').write_text(json.dumps({'public_url':target,'pages':20},indent=2)+'\n')
        if output.exists():shutil.rmtree(output)
        temporary.rename(output)
    finally:
        if temporary.exists():shutil.rmtree(temporary)
    print('Hosting files: '+str(output));return output

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--url',help='Actual public HTTPS address');parser.add_argument('--output',default=str(ROOT/'publish'));args=parser.parse_args()
    config=json.loads((ROOT/'site-config.json').read_text());target=args.url or config.get('public_url')
    if not target:parser.exit(2,'Set public_url in site-config.json or provide --url https://your-domain.bg\n')
    try:build(target,args.output)
    except (ValueError,OSError) as e:parser.exit(1,str(e)+'\n')
