import { describe, it, expect } from 'vitest';
import { slugify } from '../../src/modules/projects/projects.service.js';
import { slugParamSchema } from '../../src/modules/projects/projects.validator.js';

// ─── slugify unit tests ────────────────────────────────────────────────────

describe('slugify()', () => {
  it('lowercases a simple title', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('My Cool Project')).toBe('my-cool-project');
  });

  it('strips special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(slugify('hello   ---   world')).toBe('hello-world');
  });

  it('removes leading hyphens', () => {
    expect(slugify('---hello')).toBe('hello');
  });

  it('removes trailing hyphens', () => {
    expect(slugify('hello---')).toBe('hello');
  });

  it('handles unicode characters by stripping them', () => {
    expect(slugify('Café Résumé')).toBe('caf-r-sum');
  });

  it('handles a title with only special chars', () => {
    expect(slugify('!@#$%')).toBe('');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles numbers in title', () => {
    expect(slugify('Project 42')).toBe('project-42');
  });

  it('handles already slug-shaped title', () => {
    expect(slugify('my-project')).toBe('my-project');
  });

  it('handles dots and slashes as separators', () => {
    expect(slugify('v1.2.3 / Release')).toBe('v1-2-3-release');
  });
});

// ─── slugParamSchema unit tests ───────────────────────────────────────────

describe('slugParamSchema', () => {
  it('accepts a valid slug with hyphens', () => {
    expect(slugParamSchema.safeParse('my-cool-project').success).toBe(true);
  });

  it('accepts a slug with numbers', () => {
    expect(slugParamSchema.safeParse('project-42').success).toBe(true);
  });

  it('accepts a single lowercase word', () => {
    expect(slugParamSchema.safeParse('hello').success).toBe(true);
  });

  it('rejects uppercase letters', () => {
    expect(slugParamSchema.safeParse('My-Project').success).toBe(false);
  });

  it('rejects spaces', () => {
    expect(slugParamSchema.safeParse('my project').success).toBe(false);
  });

  it('rejects special characters', () => {
    expect(slugParamSchema.safeParse('my_project').success).toBe(false);
  });

  it('rejects leading hyphen', () => {
    expect(slugParamSchema.safeParse('-my-project').success).toBe(false);
  });

  it('rejects trailing hyphen', () => {
    expect(slugParamSchema.safeParse('my-project-').success).toBe(false);
  });

  it('rejects double hyphens', () => {
    expect(slugParamSchema.safeParse('my--project').success).toBe(false);
  });

  it('rejects empty string', () => {
    expect(slugParamSchema.safeParse('').success).toBe(false);
  });
});
