import React, { useState, useMemo } from 'react';
import yaml from 'js-yaml';

export default function ShareYourStoryForm() {
  const [data, setData] = useState({
    title: '',
    tag_line: '',
    authored_by: '',
    date: new Date().toISOString(),
    image: '',

    map: {
      location: '',
      industries: '',
      geojson: ''
    },

    metadata: {
      title: '',
      organization: '',
      industries: '',
      programming_languages: '',
      platforms: '',
      version_control_systems: '',
      build_tools: '',
      community_supports: ''
    },

    body_content: {
      title: '',
      paragraphs: ''
    },

    quote: {
      from: '',
      content: '',
      image: ''
    }
  });

  /* ---------- helpers ---------- */

  const split = (v = '') =>
    v
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

  const handleChange = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      const keys = path.split('.');
      keys.slice(0, -1).forEach(k => (ref = ref[k]));
      ref[keys.at(-1)] = value;
      return copy;
    });
  };

  /* ---------- YAML generation ---------- */

  const yamlPreview = useMemo(() => {
    const formatted = {
      map: {
        authored_by: data.authored_by,
        location: data.map.location,
        industries: split(data.map.industries),
        geojson: data.map.geojson // must stay string
      },

      metadata: {
        title: data.metadata.title,
        organization: data.metadata.organization,
        industries: split(data.metadata.industries),
        programming_languages: split(data.metadata.programming_languages),
        platforms: split(data.metadata.platforms),
        version_control_systems: split(data.metadata.version_control_systems),
        build_tools: split(data.metadata.build_tools),
        community_supports: split(data.metadata.community_supports)
      },

      body_content: {
        title: data.body_content.title,
        paragraphs: data.body_content.paragraphs
          .split('\n\n')
          .filter(Boolean)
      },

      title: data.title,
      date: data.date,
      authored_by: data.authored_by,
      image: data.image,
      tag_line: data.tag_line,

      quotes: data.quote.content
        ? [
            {
              from: data.quote.from,
              content: data.quote.content,
              image: data.quote.image
            }
          ]
        : []
    };

    return yaml.dump(formatted, {
      lineWidth: -1,
      quotingType: "'"
    });
  }, [data]);

  /* ---------- submit ---------- */

  const handleSubmit = () => {
    const issueTitle = `Story submission: ${data.title}`;

    const issueBody = `
### Story YAML

\`\`\`yaml
${yamlPreview}
\`\`\`

### Images (please upload both below 👇)
- Story image (used in \`image:\`)
- Quote image (used in \`quotes[].image\`)

> ⚠️ Please upload **both images directly to this issue** before submitting.
> The workflow will attach them to the generated PR automatically.
`;

    const url =
      `https://github.com/Vatsal-Verma/final-workflow/issues/new` +
      `?title=${encodeURIComponent(issueTitle)}` +
      `&labels=${encodeURIComponent('story-submission')}` +
      `&body=${encodeURIComponent(issueBody)}`;

    window.location.href = url;
  };

  /* ---------- UI ---------- */

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Share Your Jenkins Story</h1>

      <div style={styles.grid}>
        {/* FORM */}
        <section style={styles.card}>
          <Section title="Basic Info">
            <Input label="Story Title" onChange={v => handleChange('title', v)} />
            <Input label="Tag Line" onChange={v => handleChange('tag_line', v)} />
            <Input label="Author" onChange={v => handleChange('authored_by', v)} />

            <Input
              label="Story Image filename (upload later in GitHub issue)"
              onChange={v => handleChange('image', v)}
            />
          </Section>

          <Section title="Map">
            <Input label="Location" onChange={v => handleChange('map.location', v)} />
            <Input
              label="Industries (comma separated)"
              onChange={v => handleChange('map.industries', v)}
            />
            <Textarea
              label="GeoJSON (paste exactly, do not format)"
              placeholder='{"type":"Point","coordinates":[10.88,44.77]}'
              onChange={v => handleChange('map.geojson', v)}
            />
          </Section>

          <Section title="Metadata">
            <Input label="Metadata Title" onChange={v => handleChange('metadata.title', v)} />
            <Input label="Organization" onChange={v => handleChange('metadata.organization', v)} />
            <Input label="Industries" onChange={v => handleChange('metadata.industries', v)} />
            <Input label="Programming Languages" onChange={v => handleChange('metadata.programming_languages', v)} />
            <Input label="Platforms" onChange={v => handleChange('metadata.platforms', v)} />
            <Input label="Version Control Systems" onChange={v => handleChange('metadata.version_control_systems', v)} />
            <Input label="Build Tools" onChange={v => handleChange('metadata.build_tools', v)} />
            <Input label="Community Supports" onChange={v => handleChange('metadata.community_supports', v)} />
          </Section>

          <Section title="Story Content">
            <Input label="Body Title" onChange={v => handleChange('body_content.title', v)} />
            <Textarea
              label="Paragraphs (blank line between paragraphs)"
              onChange={v => handleChange('body_content.paragraphs', v)}
            />
          </Section>

          <Section title="Quote">
            <Input label="From" onChange={v => handleChange('quote.from', v)} />
            <Textarea label="Quote Content" onChange={v => handleChange('quote.content', v)} />
            <Input
              label="Quote image filename (upload later in GitHub issue)"
              onChange={v => handleChange('quote.image', `./${v}`)}
            />
          </Section>

          <button style={styles.button} onClick={handleSubmit}>
            Submit Story
          </button>
        </section>

        {/* YAML PREVIEW */}
        <section style={{ ...styles.card, ...styles.preview }}>
          <h2>YAML Preview</h2>
          <pre style={styles.code}>{yamlPreview}</pre>
        </section>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

const Input = ({ label, onChange }) => (
  <label style={styles.field}>
    <span>{label}</span>
    <input style={styles.input} onChange={e => onChange(e.target.value)} />
  </label>
);

const Textarea = ({ label, onChange, placeholder }) => (
  <label style={styles.field}>
    <span>{label}</span>
    <textarea
      rows={5}
      placeholder={placeholder}
      style={styles.textarea}
      onChange={e => onChange(e.target.value)}
    />
  </label>
);

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>{title}</h3>
    {children}
  </div>
);

/* ---------- styles ---------- */

const styles = {
  page: {
    padding: 32,
    maxWidth: 1400,
    margin: '0 auto',
    background: '#f8fafc',
    fontFamily: 'system-ui'
  },
  title: {
    fontSize: 34,
    fontWeight: 700,
    marginBottom: 24
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: 32,
    alignItems: 'start'
  },
  card: {
    background: '#fff',
    padding: 24,
    borderRadius: 14,
    boxShadow: '0 10px 20px rgba(0,0,0,0.06)'
  },
  preview: {
    background: '#020617',
    color: '#e5e7eb',
    position: 'sticky',
    top: 24,
    height: 'calc(100vh - 64px)',
    overflow: 'auto'
  },
  code: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 13,
    whiteSpace: 'pre-wrap'
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontWeight: 600,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 6,
    marginBottom: 16
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 14
  },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #cbd5e1'
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    resize: 'vertical'
  },
  button: {
    padding: '12px 18px',
    borderRadius: 10,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer'
  }
};
