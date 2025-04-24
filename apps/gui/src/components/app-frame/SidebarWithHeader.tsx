'use client'

import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  Button,
  Portal,
} from '@chakra-ui/react'
import {
  FiMenu,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { ReactNode } from 'react'
import { config } from '../../global/config';

export interface MenuItem {
  id: string
  name: string
  icon: IconType
}

interface NavItemProps extends FlexProps {
  icon: IconType
  children: ReactNode
  selected?: boolean
}

interface HeaderProps extends FlexProps {
  onMenuOpen: () => void
}

export type MenuSelectHandler = (id: string) => void;

interface SidebarProps extends BoxProps {
  onClose: () => void
  menuItems: MenuItem[]
  selectedMenuItem: string
  onMenuSelect: MenuSelectHandler
}

const SidebarContent = ({
  onClose,
  menuItems,
  selectedMenuItem,
  onMenuSelect,
  ...rest
}: SidebarProps) => {
  return (
    <Box
      transition="0.2s ease"
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderRight="1px"
      borderRightColor={{ base: 'gray.200', _dark: 'gray.700' }}
      w={{ base: 'full', lg: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          {config.appTitle}
        </Text>
        <CloseButton display={{ base: 'flex', lg: 'none' }} onClick={onClose} />
      </Flex>
      {menuItems.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          selected={item.id === selectedMenuItem}
          onClick={() => onMenuSelect(item.id)}
        >
          {item.name}
        </NavItem>
      ))}
    </Box>
  )
}

const NavItem = ({ icon, children, selected, ...rest }: NavItemProps) => {
  return (
    <Box
      as="a"
      // href="#"
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'cyan.400',
          color: 'white',
        }}
        color="black"
        fontSize="lg"
        fontWeight={selected ? 'extrabold' : 'normal'}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  )
}

const Header = ({ onMenuOpen, ...rest }: HeaderProps) => {
  return (
    <Flex
      ml={{ base: 0, lg: 60 }}
      px={{ base: 4, lg: 4 }}
      height="20"
      alignItems="center"
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderBottomWidth="1px"
      borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}
      justifyContent={{ base: 'space-between', lg: 'flex-end' }}
      {...rest}>
      <IconButton
        display={{ base: 'flex', lg: 'none' }} // displayed only on small screens
        onClick={onMenuOpen}
        variant="outline"
        aria-label="open menu"
      >
        <FiMenu />
      </IconButton>

      <Text
        display={{ base: 'flex', lg: 'none' }} // displayed only on small screens
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold">
        {config.appTitle}
      </Text>

      <Menu.Root>
        <Menu.Trigger asChild>
          <Button variant="outline" size="sm">
            0x00001
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="logout">Logout</Menu.Item>
              <Menu.Item value="copy">Copy</Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>

      </Menu.Root>
    </Flex>
  )
}

export interface SidebarWithHeaderProps {
  children: ReactNode,
  menuItems: MenuItem[]
  selectedMenuItemId: string 
  onMenuSelect: MenuSelectHandler
}

const SidebarWithHeader = ({
  children,
  menuItems,
  selectedMenuItemId,
  onMenuSelect
}: SidebarWithHeaderProps) => {
  const { open: drawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure()

  return (
    <Box minH="100vh" bg={{ base: 'gray.100', _dark: 'gray.900' }}>
      {/* Sidebar displayed on larger screens. Contains title displayed on larger screens */}
      <SidebarContent
        onClose={onDrawerClose}
        display={{ base: 'none', lg: 'block' }}
        menuItems={menuItems}
        selectedMenuItem={selectedMenuItemId}
        onMenuSelect={onMenuSelect}
      />
      {/* Sidebar menu displayed as a drawer on smaller screens */}
      <Drawer.Root
        open={drawerOpen}
        placement="start"
        size="full">
        <DrawerContent>
          <SidebarContent 
            onClose={onDrawerClose} 
            menuItems={menuItems} 
            selectedMenuItem={selectedMenuItemId} 
            onMenuSelect={onMenuSelect}
          />
        </DrawerContent>
      </Drawer.Root>
      {/* Header which adjusts to screen size and manages a drawer */}
      <Header onMenuOpen={onDrawerOpen} />

      <Box ml={{ base: 0, lg: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

export default SidebarWithHeader
