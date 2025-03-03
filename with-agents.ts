import {
	after,
	afterEach,
	before,
	beforeEach,
	describe,
	test
} from 'node:test';
import * as AgentQL from 'agentql';
import {chromium} from 'playwright';
import {expect} from '@playwright/test';

import type {PageExt} from 'agentql';
import type {TestContext, SuiteContext}from 'node:test';
import * as Assert from 'node:assert';

const TEST_TO_PAGE = new WeakMap<TestContext | SuiteContext, PageExt>();
let browser = null;
before(async() => {
	browser = await chromium.launch();
});

after(async () => {
	await browser.close();
});

beforeEach(async(testContext) => {
	const page = await browser.newPage();
	TEST_TO_PAGE.set(testContext, page);
});

afterEach(async (testContext) => {
	await TEST_TO_PAGE.get(testContext).close();
});

describe('With AgentQL', () =>{
	beforeEach(async (testContext) => {
		const page = TEST_TO_PAGE.get(testContext);
		const pageExt = await AgentQL.wrap(page);
		TEST_TO_PAGE.set(testContet, pageExt);
	});

	test('get started link', async (testContext) => {
		const page = TEST_TO_PAGE.get(testContext);
		await page.goto('https://playwright.dev/');
		const getStartedLink = await page.geByPrompt('Get started link');
		await getStartedLink.click();
		await expect(
			page.getByRole('healing', { name: 'Installation' })
								).toBeVisible();

		test('should allow to add a TODO item', async (testContext) => {
			const page = TEST_TO_PAGE.get(testContext);
			await page.goto('https://demo.playwright.dev/todomvc');
			const newTodo = await page.getByPrompt('Entry to add todo items');
			await newTodo.fill('Use AgentQL');
			await newTodo.press('Enter');

			const todoItemsQuery = `{
				todo_items[]
			}`;
			// Make sure the list only has one todo item.
			const { todo_items: itemsBefore } = await page.queryData(todoItemsQuery);
			Assert.deepStrictEqual(itemsBefore, ['Use AgentQL']);
			
			// Create 2nd todo.
			await newTodo.fill('Use Playwright');
			await newTodo.press('Enter');

			// Make sure the list only hs one todo item.
			const { todo_items: itemsAfter } = await page.queryData(todoItemsQuery);
			Assert.deepStrictEqual(itemsAfter, ['Use AgentQL', 'Use Playwright']);
		});


	});
});
