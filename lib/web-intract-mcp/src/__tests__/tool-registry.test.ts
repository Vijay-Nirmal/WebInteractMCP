/**
 * @fileoverview Tests for ToolRegistry class
 */

import { ToolRegistry } from '../tool-registry';
import { ToolConfiguration, ToolMode } from '../types';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  afterEach(() => {
    registry.clearTools();
  });

  describe('constructor', () => {
    it('should create an empty registry', () => {
      expect(registry.getToolCount()).toBe(0);
    });

    it('should accept logging configuration', () => {
      const registryWithLogging = new ToolRegistry(true);
      expect(registryWithLogging).toBeInstanceOf(ToolRegistry);
    });
  });

  describe('loadTools', () => {
    const validTool: ToolConfiguration = {
      toolId: 'test-tool',
      title: 'Test Tool',
      description: 'A test tool',
      mode: 'normal' as ToolMode,
      steps: [
        {
          targetElement: '#test',
          content: 'Test step'
        }
      ]
    };

    it('should load valid tools from array', async () => {
      await registry.loadTools([validTool]);
      expect(registry.getToolCount()).toBe(1);
      expect(registry.hasToolId('test-tool')).toBe(true);
    });

    it('should reject invalid tools', async () => {
      const invalidTool = {
        // Missing required fields
        toolId: 'invalid'
      } as ToolConfiguration;

      await registry.loadTools([invalidTool]);
      expect(registry.getToolCount()).toBe(0);
    });

    it('should handle empty array', async () => {
      await registry.loadTools([]);
      expect(registry.getToolCount()).toBe(0);
    });
  });

  describe('getToolById', () => {
    const testTool: ToolConfiguration = {
      toolId: 'test-tool',
      title: 'Test Tool',
      description: 'A test tool',
      mode: 'normal' as ToolMode,
      steps: [
        {
          targetElement: '#test',
          content: 'Test step'
        }
      ]
    };

    beforeEach(async () => {
      await registry.loadTools([testTool]);
    });

    it('should return tool by ID', () => {
      const tool = registry.getToolById('test-tool');
      expect(tool).toBeDefined();
      expect(tool?.toolId).toBe('test-tool');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.getToolById('non-existent');
      expect(tool).toBeUndefined();
    });
  });

  describe('getAvailableTools', () => {
    const globalTool: ToolConfiguration = {
      toolId: 'global-tool',
      title: 'Global Tool',
      description: 'Available everywhere',
      mode: 'normal' as ToolMode,
      steps: [
        {
          targetElement: '#global',
          content: 'Global step'
        }
      ]
    };

    const pageSpecificTool: ToolConfiguration = {
      toolId: 'page-tool',
      title: 'Page Tool',
      description: 'Available on specific page',
      mode: 'normal' as ToolMode,
      pageMatcher: '/dashboard',
      steps: [
        {
          targetElement: '#page',
          content: 'Page step'
        }
      ]
    };

    beforeEach(async () => {
      await registry.loadTools([globalTool, pageSpecificTool]);
    });

    it('should return global tools for any URL', () => {
      const tools = registry.getAvailableTools('https://example.com/home');
      expect(tools.size).toBe(1);
      expect(tools.has('global-tool')).toBe(true);
    });

    it('should return page-specific tools for matching URL', () => {
      const tools = registry.getAvailableTools('https://example.com/dashboard');
      expect(tools.size).toBe(2);
      expect(tools.has('global-tool')).toBe(true);
      expect(tools.has('page-tool')).toBe(true);
    });

    it('should not return page-specific tools for non-matching URL', () => {
      const tools = registry.getAvailableTools('https://example.com/settings');
      expect(tools.size).toBe(1);
      expect(tools.has('global-tool')).toBe(true);
      expect(tools.has('page-tool')).toBe(false);
    });
  });

  describe('getGlobalTools', () => {
    const globalTool: ToolConfiguration = {
      toolId: 'global-tool',
      title: 'Global Tool',
      description: 'Available everywhere',
      mode: 'normal' as ToolMode,
      steps: [
        {
          targetElement: '#global',
          content: 'Global step'
        }
      ]
    };

    const pageSpecificTool: ToolConfiguration = {
      toolId: 'page-tool',
      title: 'Page Tool',
      description: 'Available on specific page',
      mode: 'normal' as ToolMode,
      pageMatcher: '/dashboard',
      steps: [
        {
          targetElement: '#page',
          content: 'Page step'
        }
      ]
    };

    beforeEach(async () => {
      await registry.loadTools([globalTool, pageSpecificTool]);
    });

    it('should return only global tools', () => {
      const globalTools = registry.getGlobalTools();
      expect(globalTools.size).toBe(1);
      expect(globalTools.has('global-tool')).toBe(true);
      expect(globalTools.has('page-tool')).toBe(false);
    });
  });

  describe('removeTool', () => {
    const testTool: ToolConfiguration = {
      toolId: 'test-tool',
      title: 'Test Tool',
      description: 'A test tool',
      mode: 'normal' as ToolMode,
      steps: [
        {
          targetElement: '#test',
          content: 'Test step'
        }
      ]
    };

    beforeEach(async () => {
      await registry.loadTools([testTool]);
    });

    it('should remove existing tool', () => {
      expect(registry.hasToolId('test-tool')).toBe(true);
      const removed = registry.removeTool('test-tool');
      expect(removed).toBe(true);
      expect(registry.hasToolId('test-tool')).toBe(false);
    });

    it('should return false for non-existent tool', () => {
      const removed = registry.removeTool('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('clearTools', () => {
    const testTool: ToolConfiguration = {
      toolId: 'test-tool',
      title: 'Test Tool',
      description: 'A test tool',
      mode: 'normal' as ToolMode,
      steps: [
        {
          targetElement: '#test',
          content: 'Test step'
        }
      ]
    };

    beforeEach(async () => {
      await registry.loadTools([testTool]);
    });

    it('should clear all tools', () => {
      expect(registry.getToolCount()).toBe(1);
      registry.clearTools();
      expect(registry.getToolCount()).toBe(0);
    });
  });
});
