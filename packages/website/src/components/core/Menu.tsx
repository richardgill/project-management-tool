/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Disclosure, Menu as MenuComponent, Transition } from '@headlessui/react'
import { CogIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { classNames } from 'lib/classNames'
import { Container } from './Container'

const routes = [
  { name: 'Project Tree', href: '/tree' },
  { name: 'Resources', href: '/resources' },
]

export const Menu = () => {
  const location = useLocation()
  const navigation = routes.map(r => ({ ...r, current: r.href === location.pathname }))
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <Container>
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? <XIcon className="block h-6 w-6" aria-hidden="true" /> : <MenuIcon className="block h-6 w-6" aria-hidden="true" />}
                </Disclosure.Button>
              </div>
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <Link to="/" className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <img className="block lg:hidden h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
                    <img className="hidden lg:block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg" alt="Workflow" />
                  </div>
                </Link>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map(item => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'px-3 py-2 rounded-md text-sm font-medium',
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Link className="flex" to="/settings">
                  <button
                    type="button"
                    className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    <span className="sr-only">Settings</span>
                    <CogIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Link>

                {/* Profile dropdown */}
                <MenuComponent as="div" className="ml-3 relative">
                  <div>
                    <MenuComponent.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open user menu</span>
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500">
                        <span className="text-sm font-medium leading-none text-white">IN</span>
                      </span>
                    </MenuComponent.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuComponent.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuComponent.Item>
                        {({ active }) => (
                          <Link to="#" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
                            Your Profile
                          </Link>
                        )}
                      </MenuComponent.Item>
                      <MenuComponent.Item>
                        {({ active }) => (
                          <Link to="/settings" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
                            Settings
                          </Link>
                        )}
                      </MenuComponent.Item>
                      <MenuComponent.Item>
                        {({ active }) => (
                          <Link to="/signout" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
                            Sign out
                          </Link>
                        )}
                      </MenuComponent.Item>
                    </MenuComponent.Items>
                  </Transition>
                </MenuComponent>
              </div>
            </div>
          </Container>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium',
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
